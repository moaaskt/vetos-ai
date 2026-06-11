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

    // D0 target (Hoje UTC)
    const d0Start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const d0End = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // D-1 target (Amanhã UTC)
    const d1Start = new Date(d0Start);
    d1Start.setUTCDate(d1Start.getUTCDate() + 1);
    const d1End = new Date(d0End);
    d1End.setUTCDate(d1End.getUTCDate() + 1);

    // D-7 target (Daqui a 7 dias UTC)
    const d7Start = new Date(d0Start);
    d7Start.setUTCDate(d7Start.getUTCDate() + 7);
    const d7End = new Date(d0End);
    d7End.setUTCDate(d7End.getUTCDate() + 7);

    // Buscar todas as vacinas expiráveis nas 3 janelas
    // Buscar todas as vacinas expiráveis nas 3 janelas (retrocompatível com nextDoseDate ou novas vacinas SCHEDULED)
    const expiringVaccines = await this.prisma.vaccineRecord.findMany({
      where: {
        OR: [
          {
            status: 'APPLIED',
            nextDoseDate: {
              not: null,
              gte: d0Start,
              lte: d7End,
            },
          },
          {
            status: 'SCHEDULED',
            date: {
              gte: d0Start,
              lte: d7End,
            },
          },
        ],
      },
      include: {
        pet: {
          include: {
            client: true,
          },
        },
        clinic: true,
      },
    });

    for (const vaccine of expiringVaccines) {
      // Para vacinas SCHEDULED usamos a data agendada (date), para legado usamos nextDoseDate
      const targetDate = vaccine.status === 'SCHEDULED' ? vaccine.date : vaccine.nextDoseDate;
      if (!targetDate) {
        continue;
      }

      const nextDoseTime = targetDate.getTime();
      let event = '';
      let label = '';
      let codePrefix = '';

      if (nextDoseTime >= d0Start.getTime() && nextDoseTime <= d0End.getTime()) {
        event = 'VACCINE_REMINDER_DAY';
        label = 'hoje';
        codePrefix = 'day';
      } else if (nextDoseTime >= d1Start.getTime() && nextDoseTime <= d1End.getTime()) {
        event = 'VACCINE_REMINDER_1D';
        label = 'amanhã';
        codePrefix = '1d';
      } else if (nextDoseTime >= d7Start.getTime() && nextDoseTime <= d7End.getTime()) {
        event = 'VACCINE_REMINDER_7D';
        label = 'em 7 dias';
        codePrefix = '7d';
      }

      if (!event) {
        continue;
      }

      // Descobre quais canais de notificação estão ativos para este evento na clínica
      const activeChannels = await this.notificationsService.getActiveChannelsForEvent(
        vaccine.clinicId,
        event,
      );

      for (const channel of activeChannels) {
        const to = channel === 'EMAIL' ? vaccine.pet.client.email : vaccine.pet.client.phone;
        if (!to) {
          continue;
        }

        // Anti-duplicação: checar se já existe log com status = SENT para este ID, evento e canal
        const existingLog = await this.prisma.notificationLog.findFirst({
          where: {
            clinicId: vaccine.clinicId,
            event,
            channel,
            vaccineRecordId: vaccine.id,
            status: 'SENT',
          },
        });

        if (existingLog) {
          continue;
        }

        const clientName = vaccine.pet.client.name;
        const petName = vaccine.pet.name;
        const vaccineName = vaccine.name;
        const clinicName = vaccine.clinic?.name || 'Clínica Veterinária';
        const formattedDoseDate = targetDate.toLocaleDateString('pt-BR');

        const defaultBody = `Olá ${clientName}, lembramos que a vacina ${vaccineName} de ${petName} vence ${label} (${formattedDoseDate}). Atenciosamente, ${clinicName}`;

        const jobId = `vaccine-${codePrefix}-${channel.toLowerCase()}-${vaccine.id}`;

        await this.notificationsService.enqueueNotification({
          clinicId: vaccine.clinicId,
          channel,
          to,
          subject:
            channel === 'EMAIL'
              ? `Lembrete de Vacinação: ${vaccineName} de ${petName}`
              : undefined,
          body: defaultBody,
          event,
          scheduledFor: targetDate,
          clientId: vaccine.pet.clientId,
          petId: vaccine.petId,
          vaccineRecordId: vaccine.id,
          jobId,
          clientName,
          petName,
          clinicName,
          vaccineName,
          nextDoseDate: targetDate,
        });
      }
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
