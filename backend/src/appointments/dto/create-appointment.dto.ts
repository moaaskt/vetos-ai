import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  scheduledAt!: string;
  petId!: string;
  clientId!: string;
  reason?: string;
  status?: AppointmentStatus;
}
