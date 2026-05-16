import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(clinicId: string | null) {
    if (!clinicId) {
      throw new BadRequestException('Clinic context is required for tenant dashboard stats');
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

  async getSuperAdminMetrics() {
    let metrics = { totalClinics: 0, totalAppointments: 0, mrr: 0, lastUpdated: null };
    try {
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_HOST ? { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT || '6379') } : 'redis://localhost:6379');
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
              gte: new Date(new Date().setHours(0,0,0,0))
            }
          }
        }
      }
    });

    return {
      ...metrics,
      activeClinicsToday
    };
  }
}
