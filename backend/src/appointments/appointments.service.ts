import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) { }

  create(clinicId: string, data: any) {
  return this.prisma.appointment.create({
    data: {
      date: data.date,
      status: data.status,
      clinicId,
      petId: data.petId,
      clientId: data.clientId, // 👈 ADICIONA ISSO
    },
    include: {
      pet: true,
    },
  });
}

  findAll(clinicId: string) {
    return this.prisma.appointment.findMany({
      where: { clinicId },
      include: { pet: true },
    });
  }

  findOne(clinicId: string, id: string) {
    return this.prisma.appointment.findFirst({
      where: { id, clinicId },
      include: { pet: true },
    });
  }

  update(clinicId: string, id: string, data: any) {
    return this.prisma.appointment.updateMany({
      where: { id, clinicId },
      data,
    });
  }

  remove(clinicId: string, id: string) {
    return this.prisma.appointment.deleteMany({
      where: { id, clinicId },
    });
  }
}
