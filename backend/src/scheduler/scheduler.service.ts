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
  ) { }

  // Every hour: Check for appointments in the next 24 hours
  @Cron(CronExpression.EVERY_MINUTE)
  async handleAppointmentReminders() {
    this.logger.log('Running appointment reminders cron job...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          lte: tomorrow,
          gte: new Date(),
        },
        status: 'SCHEDULED',
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
        await this.notificationsService.enqueueNotification(client.phone, message);
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
        await this.notificationsService.enqueueNotification(client.phone, message);
      }
    }
  }
}
