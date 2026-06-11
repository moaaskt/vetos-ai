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

  async getTrends(clinicId: string | null) {
    if (!clinicId) {
      throw new BadRequestException('Clinic context is required for analytics');
    }

    const now = new Date();

    // 30 dias atrás
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // incluir hoje + 29 dias anteriores
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Hoje (fim do dia)
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // 90 dias atrás
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    // Próximos 7 dias para vacinas
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    // Consultas nos últimos 30 dias
    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        date: {
          gte: thirtyDaysAgo,
          lte: endOfToday,
        },
      },
      select: {
        date: true,
      },
    });

    // Notificações nos últimos 30 dias
    const notifications = await this.prisma.notificationLog.findMany({
      where: {
        clinicId,
        createdAt: {
          gte: thirtyDaysAgo,
          lte: endOfToday,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Agrupamento de canais nos últimos 30 dias
    const notificationsByChannelGrouped = await this.prisma.notificationLog.groupBy({
      by: ['channel'],
      where: {
        clinicId,
        createdAt: {
          gte: thirtyDaysAgo,
          lte: endOfToday,
        },
      },
      _count: { id: true },
    });

    // Próximas vacinas (7 dias) com detalhes do pet e tutor
    const upcomingVaccines = await this.prisma.vaccineRecord.findMany({
      where: {
        clinicId,
        nextDoseDate: {
          gte: startOfToday,
          lte: next7Days,
        },
      },
      include: {
        pet: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        nextDoseDate: 'asc',
      },
    });

    // Clientes inativos (sem consultas nos últimos 90 dias)
    const inactiveClientsRaw = await this.prisma.client.findMany({
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
      include: {
        appointments: {
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 50,
    });

    // Processamento de dados
    const appointmentsTrend = this.buildAppointmentsTrend(appointments, thirtyDaysAgo);
    const notificationsTrend = this.buildNotificationsTrend(notifications, thirtyDaysAgo);

    // Mapeamento dos canais nos últimos 30 dias
    const channelMap = { EMAIL: 0, WHATSAPP: 0 };
    notificationsByChannelGrouped.forEach((group) => {
      if (group.channel in channelMap) {
        channelMap[group.channel] = group._count.id;
      }
    });

    // Processamento e ordenação de clientes inativos (top 10)
    const inactiveClientsList = inactiveClientsRaw
      .map((client) => {
        const lastApp = client.appointments[0];
        const lastActiveDate = lastApp ? lastApp.date : client.createdAt;
        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          lastActiveDate,
          hasAppointments: !!lastApp,
        };
      })
      .sort((a, b) => new Date(a.lastActiveDate).getTime() - new Date(b.lastActiveDate).getTime())
      .slice(0, 10);

    return {
      appointmentsTrend,
      notificationsTrend,
      notificationsByChannel: channelMap,
      upcomingVaccinesList: upcomingVaccines,
      inactiveClientsList,
    };
  }

  private buildAppointmentsTrend(appointments: { date: Date }[], startDate: Date) {
    const trendMap: Record<string, number> = {};
    
    // Inicializar os últimos 30 dias com 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = 0;
    }

    appointments.forEach((app) => {
      const dateStr = app.date.toISOString().split('T')[0];
      if (dateStr in trendMap) {
        trendMap[dateStr]++;
      }
    });

    return Object.entries(trendMap).map(([date, count]) => ({
      date,
      count,
    }));
  }

  private buildNotificationsTrend(notifications: { createdAt: Date; status: string }[], startDate: Date) {
    const trendMap: Record<string, { sent: number; failed: number }> = {};

    // Inicializar os últimos 30 dias
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap[dateStr] = { sent: 0, failed: 0 };
    }

    notifications.forEach((notif) => {
      const dateStr = notif.createdAt.toISOString().split('T')[0];
      if (dateStr in trendMap) {
        if (notif.status === 'SENT') {
          trendMap[dateStr].sent++;
        } else if (notif.status === 'FAILED') {
          trendMap[dateStr].failed++;
        }
      }
    });

    return Object.entries(trendMap).map(([date, stats]) => ({
      date,
      sent: stats.sent,
      failed: stats.failed,
    }));
  }
}

