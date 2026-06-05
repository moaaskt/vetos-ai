import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(clinicId: string | null) {
    if (!clinicId) {
      throw new BadRequestException('Clinic context is required for analytics');
    }

    const now = new Date();
    
    // Hoje
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Esta Semana (Domingo a Sábado)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Próximos 7 dias para vacinas
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);

    // Clientes inativos (sem consultas nos últimos 90 dias)
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Notificações nos últimos 7 dias
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      appointmentsToday,
      appointmentsThisWeek,
      appointmentsGrouped,
      totalClients,
      totalPets,
      upcomingVaccines,
      inactiveClients,
      sentNotifications,
      failedNotifications,
      notificationsByChannelGrouped,
    ] = await Promise.all([
      // 1. appointmentsToday
      this.prisma.appointment.count({
        where: {
          clinicId,
          date: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
      }),

      // 2. appointmentsThisWeek
      this.prisma.appointment.count({
        where: {
          clinicId,
          date: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      }),

      // 3. appointmentsByStatus
      this.prisma.appointment.groupBy({
        by: ['status'],
        where: { clinicId },
        _count: { id: true },
      }),

      // 4. totalClients
      this.prisma.client.count({
        where: { clinicId },
      }),

      // 5. totalPets
      this.prisma.pet.count({
        where: { clinicId },
      }),

      // 6. upcomingVaccinesNext7Days
      this.prisma.vaccineRecord.count({
        where: {
          clinicId,
          nextDoseDate: {
            gte: startOfToday,
            lte: next7Days,
          },
        },
      }),

      // 7. inactiveClients90Days
      this.prisma.client.count({
        where: {
          clinicId,
          appointments: {
            none: {
              date: {
                gte: ninetyDaysAgo,
              },
            },
          },
        },
      }),

      // 8a. sent notifications last 7 days
      this.prisma.notificationLog.count({
        where: {
          clinicId,
          status: 'SENT',
          createdAt: { gte: sevenDaysAgo },
        },
      }),

      // 8b. failed notifications last 7 days
      this.prisma.notificationLog.count({
        where: {
          clinicId,
          status: 'FAILED',
          createdAt: { gte: sevenDaysAgo },
        },
      }),

      // 8c. notifications last 7 days grouped by channel
      this.prisma.notificationLog.groupBy({
        by: ['channel'],
        where: {
          clinicId,
          createdAt: { gte: sevenDaysAgo },
        },
        _count: { id: true },
      }),
    ]);

    // Mapeia agrupamento de agendamentos por status
    const statusMap = { SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 };
    appointmentsGrouped.forEach((group) => {
      if (group.status in statusMap) {
        statusMap[group.status] = group._count.id;
      }
    });

    // Mapeia agrupamento de notificações por canal
    const channelMap = { EMAIL: 0, WHATSAPP: 0 };
    notificationsByChannelGrouped.forEach((group) => {
      if (group.channel in channelMap) {
        channelMap[group.channel] = group._count.id;
      }
    });

    return {
      appointmentsToday,
      appointmentsThisWeek,
      appointmentsByStatus: statusMap,
      totalClients,
      totalPets,
      upcomingVaccinesNext7Days: upcomingVaccines,
      inactiveClients90Days: inactiveClients,
      notificationsLast7Days: {
        sent: sentNotifications,
        failed: failedNotifications,
        byChannel: channelMap,
      },
    };
  }
}
