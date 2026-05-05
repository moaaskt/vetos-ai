import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(clinicId: string) {
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
}
