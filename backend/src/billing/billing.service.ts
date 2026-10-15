import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

export interface ResourceUsageMetrics {
  plan: {
    id: string;
    name: string;
    features: string[];
  };
  subscriptionId: string;
  metrics: {
    staff: {
      used: number;
      limit: number;
      percentage: number;
      isExceeded: boolean;
    };
    notifications: {
      used: number;
      limit: number;
      percentage: number;
      isExceeded: boolean;
      resetDate: string;
    };
    storage: {
      usedMB: number;
      limitMB: number;
      percentage: number;
      isExceeded: boolean;
    };
  };
}

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém a assinatura da clínica. Se não existir, vincula automaticamente
   * ao plano padrão 'Starter' como fallback resiliente e persistente.
   */
  async getClinicSubscription(clinicId: string) {
    let subscription = await this.prisma.clinicSubscription.findUnique({
      where: { clinicId },
      include: { plan: true },
    });

    if (!subscription) {
      let defaultPlan = await this.prisma.plan.findUnique({
        where: { name: 'Starter' },
      });

      if (!defaultPlan) {
        defaultPlan = await this.prisma.plan.findFirst();
      }

      if (!defaultPlan) {
        defaultPlan = await this.prisma.plan.create({
          data: {
            name: 'Starter',
            maxStaffSeats: 3,
            maxNotifications: 150,
            maxStorage: 1024,
            features: JSON.stringify(['email_notifications', 'calendar']),
          },
        });
      }

      subscription = await this.prisma.clinicSubscription.create({
        data: {
          clinicId,
          planId: defaultPlan.id,
        },
        include: { plan: true },
      });
    }

    return subscription;
  }

  /**
   * Consolida métricas de consumo real da clínica versus limites contratados.
   */
  async getClinicUsage(clinicId: string): Promise<ResourceUsageMetrics> {
    const subscription = await this.getClinicSubscription(clinicId);

    const maxSeats =
      subscription.customMaxStaffSeats ?? subscription.plan.maxStaffSeats;
    const maxNotifications =
      subscription.customMaxNotifications ?? subscription.plan.maxNotifications;
    const maxStorageMB =
      subscription.customMaxStorage ?? subscription.plan.maxStorage;

    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    const nextMonthReset = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
    );

    const [usedSeats, usedNotifications, storageAggregate] =
      await Promise.all([
        this.prisma.user.count({ where: { clinicId } }),
        this.prisma.notificationLog.count({
          where: {
            clinicId,
            status: 'SENT',
            createdAt: { gte: startOfMonth },
          },
        }),
        this.prisma.clinicalAttachment.aggregate({
          where: { clinicId },
          _sum: { fileSize: true },
        }),
      ]);

    const totalStorageBytes = Number(storageAggregate._sum?.fileSize ?? 0n);
    const usedStorageMB =
      Math.round((totalStorageBytes / (1024 * 1024)) * 100) / 100;

    const staffPercentage =
      maxSeats > 0 ? Math.min(100, Math.round((usedSeats / maxSeats) * 100)) : 0;
    const notificationsPercentage =
      maxNotifications > 0
        ? Math.min(
            100,
            Math.round((usedNotifications / maxNotifications) * 100),
          )
        : 0;
    const storagePercentage =
      maxStorageMB > 0
        ? Math.min(100, Math.round((usedStorageMB / maxStorageMB) * 100))
        : 0;

    let features: string[] = [];
    try {
      features =
        typeof subscription.plan.features === 'string'
          ? JSON.parse(subscription.plan.features)
          : (subscription.plan.features as any);
    } catch {
      features = [];
    }

    return {
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        features: Array.isArray(features) ? features : [],
      },
      subscriptionId: subscription.id,
      metrics: {
        staff: {
          used: usedSeats,
          limit: maxSeats,
          percentage: staffPercentage,
          isExceeded: usedSeats >= maxSeats,
        },
        notifications: {
          used: usedNotifications,
          limit: maxNotifications,
          percentage: notificationsPercentage,
          isExceeded: usedNotifications >= maxNotifications,
          resetDate: nextMonthReset.toISOString(),
        },
        storage: {
          usedMB: usedStorageMB,
          limitMB: maxStorageMB,
          percentage: storagePercentage,
          isExceeded: usedStorageMB >= maxStorageMB,
        },
      },
    };
  }

  /**
   * Retorna os planos públicos cadastrados no sistema.
   */
  async getAvailablePlans() {
    const plans = await this.prisma.plan.findMany({
      orderBy: { maxStaffSeats: 'asc' },
    });

    return plans.map((p) => {
      let features: string[] = [];
      try {
        features =
          typeof p.features === 'string'
            ? JSON.parse(p.features)
            : (p.features as any);
      } catch {
        features = [];
      }
      return {
        ...p,
        features: Array.isArray(features) ? features : [],
      };
    });
  }

  /**
   * Executa a troca de plano (Upgrade ou Downgrade) de uma clínica.
   */
  async changePlan(clinicId: string, planId: string, actorRole?: Role) {
    const targetPlan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!targetPlan) {
      throw new NotFoundException('Plano solicitado não encontrado.');
    }

    const currentSub = await this.getClinicSubscription(clinicId);

    // Se a alteração for realizada pelo SUPERADMIN, preserva overrides customizados.
    // Caso seja acionada pelo tenant (ADMIN), reseta os overrides adotando os limites padrões do novo plano.
    const isSuperAdmin = actorRole === Role.SUPERADMIN;
    const updateData: Prisma.ClinicSubscriptionUpdateInput = {
      plan: { connect: { id: targetPlan.id } },
      ...(isSuperAdmin
        ? {}
        : {
            customMaxStaffSeats: null,
            customMaxNotifications: null,
            customMaxStorage: null,
            customFeatures: Prisma.DbNull,
          }),
    };

    const updated = await this.prisma.clinicSubscription.update({
      where: { id: currentSub.id },
      data: updateData,
      include: {
        plan: true,
      },
    });

    return {
      success: true,
      message: `Plano atualizado com sucesso para ${targetPlan.name}.`,
      subscription: updated,
    };
  }

  // --- TRAVAS E ENFORCEMENT DE LIMITES (PLAN LIMITS GUARD) ---

  /**
   * Valida se a clínica ainda possui licenças disponíveis para cadastrar novos membros de equipe.
   */
  async assertCanAddStaff(clinicId: string): Promise<void> {
    const sub = await this.getClinicSubscription(clinicId);
    const maxSeats = sub.customMaxStaffSeats ?? sub.plan.maxStaffSeats;
    const currentCount = await this.prisma.user.count({ where: { clinicId } });

    if (currentCount >= maxSeats) {
      throw new ForbiddenException(
        `Limite de profissionais da equipe atingido (${currentCount}/${maxSeats}). Faça upgrade do plano para convidar novos membros.`,
      );
    }
  }

  /**
   * Valida se a clínica não estourou sua cota mensal de lembretes e mensagens.
   */
  async assertCanSendNotification(clinicId: string): Promise<void> {
    const sub = await this.getClinicSubscription(clinicId);
    const maxNotifications =
      sub.customMaxNotifications ?? sub.plan.maxNotifications;

    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );

    const sentThisMonth = await this.prisma.notificationLog.count({
      where: {
        clinicId,
        status: 'SENT',
        createdAt: { gte: startOfMonth },
      },
    });

    if (sentThisMonth >= maxNotifications) {
      throw new ForbiddenException(
        `Cota mensal de notificações atingida (${sentThisMonth}/${maxNotifications}). Faça upgrade do plano para continuar disparando lembretes.`,
      );
    }
  }

  /**
   * Valida se o upload de um anexo não ultrapassará o espaço em disco contratado.
   */
  async assertCanUploadStorage(
    clinicId: string,
    additionalBytes: number,
  ): Promise<void> {
    const sub = await this.getClinicSubscription(clinicId);
    const maxStorageMB = sub.customMaxStorage ?? sub.plan.maxStorage;

    const storageAggregate = await this.prisma.clinicalAttachment.aggregate({
      where: { clinicId },
      _sum: { fileSize: true },
    });
    const currentBytes = Number(storageAggregate._sum?.fileSize ?? 0n);
    const newTotalMB = (currentBytes + additionalBytes) / (1024 * 1024);

    if (newTotalMB > maxStorageMB) {
      throw new ForbiddenException(
        `Limite de armazenamento do plano excedido (${Math.round(newTotalMB)}MB/${maxStorageMB}MB). Faça upgrade do plano para armazenar mais exames e laudos.`,
      );
    }
  }

  /**
   * Processamento de webhook de gateway de pagamento (Stripe / Asaas).
   */
  async handleWebhook(payload: any, signature?: string) {
    return {
      received: true,
      event: payload?.event || 'invoice.payment_succeeded',
      signatureProvided: Boolean(signature),
    };
  }
}
