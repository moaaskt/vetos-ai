import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Every hour: Check for appointments in the next 24 hours
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAppointmentReminders() {
    this.logger.log('Running appointment reminders cron job...');
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          lte: tomorrow,
          gte: now,
        },
        status: 'SCHEDULED',
        notifiedAt: null,
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

    for (const appointment of upcomingAppointments) {
      const client = appointment.pet.client;
      if (client.phone) {
        const message = `Hello ${client.name}, this is a reminder for ${appointment.pet.name}'s appointment at ${appointment.clinic.name} on ${appointment.date.toLocaleString()}.`;
        await this.notificationsService.enqueueNotification(
          client.phone,
          message,
        );

        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: { notifiedAt: new Date() },
        });
      }
    }
  }

  // Daily: Check for inactive clients (> 90 days since last appointment)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleInactiveClients() {
    this.logger.log('Running inactive clients detection cron job...');

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // This is a simplified logic: find clients whose last appointment date is < ninetyDaysAgo
    // In a real app, we would query for clients where NOT EXISTS (appointment > ninetyDaysAgo)
    const inactiveClients = await this.prisma.client.findMany({
      where: {
        appointments: {
          none: {
            date: {
              gte: ninetyDaysAgo,
            },
          },
        },
      },
    });

    for (const client of inactiveClients) {
      if (client.phone) {
        const message = `Hello ${client.name}, we haven't seen ${client.name} at the clinic for a while. Would you like to schedule a check-up?`;
        await this.notificationsService.enqueueNotification(
          client.phone,
          message,
        );
      }
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
}
