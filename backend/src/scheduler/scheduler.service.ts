import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly vaccineWindowDays = 7;
  private readonly retentionCooldownDays = 90;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyVeterinaryAutomations() {
    this.logger.log('Running daily veterinary automation cron job...');
    await this.enqueueVaccineReminders();
    await this.enqueueRetentionReminders();
  }

  async enqueueVaccineReminders(): Promise<void> {
    const now = new Date();
    const windowEnd = new Date(now.getTime());
    windowEnd.setDate(windowEnd.getDate() + this.vaccineWindowDays);
    const recentWindowStart = new Date(now.getTime());
    recentWindowStart.setDate(
      recentWindowStart.getDate() - this.vaccineWindowDays,
    );

    const expiringVaccines = await this.prisma.vaccineRecord.findMany({
      where: {
        nextDoseDate: {
          gte: now,
          lte: windowEnd,
        },
      },
      include: {
        pet: {
          include: {
            client: true,
          },
        },
      },
    });

    for (const vaccine of expiringVaccines) {
      if (!vaccine.nextDoseDate) {
        continue;
      }

      const existingLog = await this.prisma.notificationLog.findFirst({
        where: {
          clinicId: vaccine.clinicId,
          event: 'VACCINE_EXPIRATION',
          petId: vaccine.petId,
          scheduledFor: vaccine.nextDoseDate,
          status: 'SENT',
          createdAt: {
            gte: recentWindowStart,
          },
        },
      });

      if (existingLog) {
        continue;
      }

      const contact = this.resolveContact(vaccine.pet.client);

      if (!contact) {
        continue;
      }

      await this.notificationsService.enqueueNotification({
        clinicId: vaccine.clinicId,
        channel: contact.channel,
        to: contact.to,
        subject:
          contact.channel === 'EMAIL'
            ? `Vacina de ${vaccine.pet.name} esta proxima`
            : undefined,
        body: `A vacina ${vaccine.name} de ${vaccine.pet.name} vence em ${vaccine.nextDoseDate.toLocaleDateString('pt-BR')}.`,
        event: 'VACCINE_EXPIRATION',
        scheduledFor: vaccine.nextDoseDate,
        clientId: vaccine.pet.clientId,
        petId: vaccine.petId,
        jobId: `vaccine:${vaccine.id}:${vaccine.nextDoseDate.toISOString()}`,
      });
    }
  }

  async enqueueRetentionReminders(): Promise<void> {
    const now = new Date();
    const cooldownStart = new Date(now.getTime());
    cooldownStart.setDate(cooldownStart.getDate() - this.retentionCooldownDays);

    const inactiveClients = await this.prisma.client.findMany({
      where: {
        appointments: {
          none: {
            date: {
              gte: cooldownStart,
            },
          },
        },
        OR: [{ email: { not: null } }, { phone: { not: null } }],
      },
      include: {
        appointments: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });

    for (const client of inactiveClients) {
      const existingLog = await this.prisma.notificationLog.findFirst({
        where: {
          clinicId: client.clinicId,
          event: 'RETENTION',
          clientId: client.id,
          status: 'SENT',
          createdAt: {
            gte: cooldownStart,
          },
        },
      });

      if (existingLog) {
        continue;
      }

      const contact = this.resolveContact(client);

      if (!contact) {
        continue;
      }

      const lastAppointment = client.appointments[0]?.date;
      const lastAppointmentText = lastAppointment
        ? ` desde ${lastAppointment.toLocaleDateString('pt-BR')}`
        : '';

      await this.notificationsService.enqueueNotification({
        clinicId: client.clinicId,
        channel: contact.channel,
        to: contact.to,
        subject:
          contact.channel === 'EMAIL'
            ? 'Sentimos sua falta na clinica'
            : undefined,
        body: `Ola ${client.name}, nao vemos voce na clinica${lastAppointmentText}. Que tal agendar um check-up?`,
        event: 'RETENTION',
        scheduledFor: now,
        clientId: client.id,
        jobId: `retention:${client.clinicId}:${client.id}:${now.toISOString().slice(0, 10)}`,
      });
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleGlobalMetricsAggregation() {
    this.logger.log('Aggregating global metrics...');
    try {
      const totalClinics = await this.prisma.clinic.count();
      const totalAppointments = await this.prisma.appointment.count();
      // For MRR, we'd normally join subscriptions and plans.
      // For now, we simulate MRR aggregation.
      const mrr = totalClinics * 100; // Mock MRR calculation

      const metrics = {
        totalClinics,
        totalAppointments,
        mrr,
        lastUpdated: new Date(),
      };

      const Redis = require('ioredis');
      const redis = new Redis(
        process.env.REDIS_HOST
          ? {
              host: process.env.REDIS_HOST,
              port: parseInt(process.env.REDIS_PORT || '6379'),
            }
          : 'redis://localhost:6379',
      );
      await redis.set('global_metrics:cache', JSON.stringify(metrics));
      redis.disconnect();
    } catch (e) {
      this.logger.error('Failed to aggregate global metrics', e);
    }
  }

  private resolveContact(client: {
    email: string | null;
    phone: string | null;
  }):
    | { channel: 'EMAIL'; to: string }
    | { channel: 'WHATSAPP'; to: string }
    | null {
    if (client.email) {
      return { channel: 'EMAIL', to: client.email };
    }

    if (client.phone) {
      return { channel: 'WHATSAPP', to: client.phone };
    }

    return null;
  }
}
