import { Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  AppointmentAutomationService,
  appointmentAutomationInclude,
} from './appointment-automation.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private appointmentAutomationService: AppointmentAutomationService,
  ) {}

  async create(clinicId: string, data: CreateAppointmentDto) {
    const appointment = await this.prisma.appointment.create({
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

    await this.appointmentAutomationService.onAppointmentCreated(appointment);

    return appointment;
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
    const previous = await this.findOne(clinicId, id);
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

    const appointment = await this.findOne(clinicId, id);

    if (previous && appointment) {
      await this.appointmentAutomationService.onAppointmentUpdated(
        previous,
        appointment,
      );
    }

    return appointment;
  }

  async remove(clinicId: string, id: string) {
    const result = await this.prisma.appointment.deleteMany({
      where: { id, clinicId },
    });

    if (result.count > 0) {
      await this.appointmentAutomationService.onAppointmentCancelled(id);
    }

    return result;
  }
}

const appointmentInclude = appointmentAutomationInclude;
