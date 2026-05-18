import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  create(clinicId: string, data: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        date: new Date(data.scheduledAt),
        reason: data.reason,
        status: data.status ?? AppointmentStatus.SCHEDULED,
        clinicId,
        petId: data.petId,
        clientId: data.clientId,
      },
      include: appointmentInclude,
    });
  }

  findAll(clinicId: string) {
    return this.prisma.appointment.findMany({
      where: { clinicId },
      include: appointmentInclude,
      orderBy: { date: 'asc' },
    });
  }

  findOne(clinicId: string, id: string) {
    return this.prisma.appointment.findFirst({
      where: { id, clinicId },
      include: appointmentInclude,
    });
  }

  async update(clinicId: string, id: string, data: UpdateAppointmentDto) {
    const updateData: Prisma.AppointmentUncheckedUpdateManyInput = {};

    if (data.scheduledAt) {
      updateData.date = new Date(data.scheduledAt);
    }

    if (data.reason !== undefined) {
      updateData.reason = data.reason;
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.petId !== undefined) {
      updateData.petId = data.petId;
    }

    if (data.clientId !== undefined) {
      updateData.clientId = data.clientId;
    }

    await this.prisma.appointment.updateMany({
      where: { id, clinicId },
      data: updateData,
    });

    return this.findOne(clinicId, id);
  }

  remove(clinicId: string, id: string) {
    return this.prisma.appointment.deleteMany({
      where: { id, clinicId },
    });
  }
}

const appointmentInclude = {
  pet: {
    include: {
      client: true,
    },
  },
  client: true,
} satisfies Prisma.AppointmentInclude;
