import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(clinicId: string | null) {
    if (!clinicId) {
      throw new BadRequestException(
        'Clinic context is required for tenant dashboard stats',
      );
    }

    const [totalClients, totalPets, totalAppointments] = await Promise.all([
      this.prisma.client.count({ where: { clinicId } }),
      this.prisma.pet.count({ where: { clinicId } }),
      this.prisma.appointment.count({ where: { clinicId } }),
    ]);

    return {
      totalClients,
      totalPets,
      totalAppointments,
    };
  }

  async getActivity(clinicId: string | null) {
    if (!clinicId) {
      throw new BadRequestException(
        'Clinic context is required for tenant dashboard activity',
      );
    }

    const [
      clients,
      pets,
      appointments,
      clinicalRecords,
      allergies,
      vaccines,
      weights,
    ] = await Promise.all([
      this.prisma.client.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.pet.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { client: { select: { name: true } } },
      }),
      this.prisma.appointment.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { pet: { select: { name: true } } },
      }),
      this.prisma.clinicalRecord.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { pet: { select: { name: true } } },
      }),
      this.prisma.allergy.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { pet: { select: { name: true } } },
      }),
      this.prisma.vaccineRecord.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { pet: { select: { name: true } } },
      }),
      this.prisma.weightRecord.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { pet: { select: { name: true } } },
      }),
    ]);

    const activities: any[] = [];

    // Clientes
    clients.forEach((c) => {
      activities.push({
        id: `client-${c.id}`,
        type: 'client',
        text: `Novo cliente cadastrado: ${c.name}`,
        date: c.createdAt.toISOString(),
      });
    });

    // Pets
    pets.forEach((p) => {
      activities.push({
        id: `pet-${p.id}`,
        type: 'pet',
        text: `Novo paciente cadastrado: ${p.name} (${p.species}) - Tutor(a): ${p.client?.name || 'Não informado'}`,
        date: p.createdAt.toISOString(),
      });
    });

    // Agendamentos (Appointments)
    appointments.forEach((a) => {
      const formattedDate = new Date(a.date).toLocaleDateString('pt-BR');
      activities.push({
        id: `appointment-${a.id}`,
        type: 'appointment',
        text: `Consulta agendada para ${a.pet?.name || 'Paciente'}: ${a.reason || 'Consulta geral'} em ${formattedDate}`,
        date: a.createdAt.toISOString(),
      });
    });

    // Prontuários (ClinicalRecord)
    clinicalRecords.forEach((cr) => {
      const typeLabel = cr.type === 'PROCEDURE' ? 'Procedimento clínico' : 'Evolução clínica';
      const detail = cr.title || (cr.content.length > 40 ? `${cr.content.substring(0, 40)}...` : cr.content);
      activities.push({
        id: `clinicalRecord-${cr.id}`,
        type: 'clinicalRecord',
        text: `${typeLabel} para ${cr.pet?.name || 'Paciente'}: ${detail}`,
        date: cr.createdAt.toISOString(),
      });
    });

    // Alergias
    allergies.forEach((al) => {
      activities.push({
        id: `allergy-${al.id}`,
        type: 'allergy',
        text: `Alergia documentada para ${al.pet?.name || 'Paciente'}: ${al.name}`,
        date: al.createdAt.toISOString(),
      });
    });

    // Vacinas
    vaccines.forEach((v) => {
      activities.push({
        id: `vaccine-${v.id}`,
        type: 'vaccine',
        text: `Aplicação de vacina registrada: ${v.name} em ${v.pet?.name || 'Paciente'}`,
        date: v.createdAt.toISOString(),
      });
    });

    // Pesos
    weights.forEach((w) => {
      activities.push({
        id: `weightRecord-${w.id}`,
        type: 'weightRecord',
        text: `Novo registro de peso para ${w.pet?.name || 'Paciente'}: ${w.weight} kg`,
        date: w.createdAt.toISOString(),
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  async getSuperAdminMetrics() {
    let metrics = {
      totalClinics: 0,
      totalAppointments: 0,
      mrr: 0,
      lastUpdated: null,
    };
    try {
      const Redis = require('ioredis');
      const redis = new Redis(
        process.env.REDIS_HOST
          ? {
              host: process.env.REDIS_HOST,
              port: parseInt(process.env.REDIS_PORT || '6379'),
            }
          : 'redis://localhost:6379',
      );
      const cached = await redis.get('global_metrics:cache');
      if (cached) {
        metrics = JSON.parse(cached);
      } else {
        metrics.totalClinics = await this.prisma.clinic.count();
        metrics.totalAppointments = await this.prisma.appointment.count();
        metrics.mrr = metrics.totalClinics * 100;
      }
      redis.disconnect();
    } catch (e) {
      // Fallback
      metrics.totalClinics = await this.prisma.clinic.count();
      metrics.totalAppointments = await this.prisma.appointment.count();
      metrics.mrr = metrics.totalClinics * 100;
    }

    // Live override for critical metric
    const activeClinicsToday = await this.prisma.clinic.count({
      where: {
        appointments: {
          some: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    return {
      ...metrics,
      activeClinicsToday,
    };
  }
}
