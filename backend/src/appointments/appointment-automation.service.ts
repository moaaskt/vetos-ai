import { Injectable, Logger } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: typeof appointmentAutomationInclude;
}>;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

@Injectable()
export class AppointmentAutomationService {
  private readonly logger = new Logger(AppointmentAutomationService.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  async onAppointmentCreated(
    appointment: AppointmentWithRelations,
  ): Promise<void> {
    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      return;
    }

    await this.enqueueAppointmentNotification(appointment, {
      event: 'APPOINTMENT_CREATED',
      subject: 'Consulta agendada',
      body: this.buildAppointmentCreatedBody(appointment),
      jobId: this.getNotificationJobIds(appointment.id).created,
    });
    await this.scheduleAppointmentReminders(appointment);
  }

  async onAppointmentUpdated(
    previous: AppointmentWithRelations,
    appointment: AppointmentWithRelations,
  ): Promise<void> {
    await this.cancelAppointmentJobs(previous.id);

    if (appointment.status === AppointmentStatus.SCHEDULED) {
      await this.scheduleAppointmentReminders(appointment);
      return;
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      await this.scheduleFollowUp(appointment);
    }
  }

  async onAppointmentCancelled(appointmentId: string): Promise<void> {
    await this.cancelAppointmentJobs(appointmentId);
  }

  private async scheduleAppointmentReminders(
    appointment: AppointmentWithRelations,
  ): Promise<void> {
    await this.enqueueDelayedAppointmentNotification(appointment, {
      event: 'APPOINTMENT_REMINDER_24H',
      subject: 'Lembrete de consulta',
      body: this.buildAppointmentReminderBody(appointment, '24 horas'),
      sendAt: new Date(appointment.date.getTime() - DAY_MS),
      jobId: this.getNotificationJobIds(appointment.id).reminder24h,
    });

    await this.enqueueDelayedAppointmentNotification(appointment, {
      event: 'APPOINTMENT_REMINDER_2H',
      subject: 'Consulta em breve',
      body: this.buildAppointmentReminderBody(appointment, '2 horas'),
      sendAt: new Date(appointment.date.getTime() - 2 * HOUR_MS),
      jobId: this.getNotificationJobIds(appointment.id).reminder2h,
    });
  }

  private async scheduleFollowUp(
    appointment: AppointmentWithRelations,
  ): Promise<void> {
    await this.enqueueDelayedAppointmentNotification(appointment, {
      event: 'APPOINTMENT_FOLLOW_UP',
      subject: 'Como foi a consulta?',
      body: this.buildFollowUpBody(appointment),
      sendAt: new Date(appointment.date.getTime() + DAY_MS),
      jobId: this.getNotificationJobIds(appointment.id).followUp,
    });
  }

  private async enqueueDelayedAppointmentNotification(
    appointment: AppointmentWithRelations,
    input: {
      event:
        | 'APPOINTMENT_REMINDER_24H'
        | 'APPOINTMENT_REMINDER_2H'
        | 'APPOINTMENT_FOLLOW_UP';
      subject: string;
      body: string;
      sendAt: Date;
      jobId: string;
    },
  ): Promise<void> {
    const delayMs = input.sendAt.getTime() - Date.now();

    if (delayMs <= 0) {
      this.logger.log(
        `Skipping past ${input.event} job for appointment ${appointment.id}`,
      );
      return;
    }

    await this.enqueueAppointmentNotification(appointment, {
      event: input.event,
      subject: input.subject,
      body: input.body,
      scheduledFor: input.sendAt,
      delayMs,
      jobId: input.jobId,
    });
  }

  private async enqueueAppointmentNotification(
    appointment: AppointmentWithRelations,
    input: {
      event:
        | 'APPOINTMENT_CREATED'
        | 'APPOINTMENT_REMINDER_24H'
        | 'APPOINTMENT_REMINDER_2H'
        | 'APPOINTMENT_FOLLOW_UP';
      subject: string;
      body: string;
      scheduledFor?: Date;
      delayMs?: number;
      jobId: string;
    },
  ): Promise<void> {
    const contact = this.resolveContact(appointment);

    if (!contact) {
      this.logger.warn(
        `Skipping ${input.event} for appointment ${appointment.id}: client has no contact info`,
      );
      return;
    }

    const client = appointment.client ?? appointment.pet.client;

    await this.notificationsService.enqueueNotification({
      clinicId: appointment.clinicId,
      channel: contact.channel,
      to: contact.to,
      subject: contact.channel === 'EMAIL' ? input.subject : undefined,
      body: input.body,
      event: input.event,
      scheduledFor: input.scheduledFor,
      appointmentId: appointment.id,
      appointmentDate: appointment.date,
      clientId: appointment.clientId,
      petId: appointment.petId,
      delayMs: input.delayMs,
      jobId: input.jobId,
      clientName: client?.name,
      petName: appointment.pet?.name,
      clinicName: appointment.clinic?.name,
    });
  }

  private async cancelAppointmentJobs(appointmentId: string): Promise<void> {
    const jobIds = this.getNotificationJobIds(appointmentId);
    await Promise.all([
      this.notificationsService.cancelNotificationJob(jobIds.created),
      this.notificationsService.cancelNotificationJob(jobIds.reminder24h),
      this.notificationsService.cancelNotificationJob(jobIds.reminder2h),
      this.notificationsService.cancelNotificationJob(jobIds.followUp),
    ]);
  }

  private resolveContact(
    appointment: AppointmentWithRelations,
  ):
    | { channel: 'EMAIL'; to: string }
    | { channel: 'WHATSAPP'; to: string }
    | null {
    const client = appointment.client ?? appointment.pet.client;

    if (client.email) {
      return { channel: 'EMAIL', to: client.email };
    }

    if (client.phone) {
      return { channel: 'WHATSAPP', to: client.phone };
    }

    return null;
  }

  private buildAppointmentCreatedBody(
    appointment: AppointmentWithRelations,
  ): string {
    return `Consulta de ${appointment.pet.name} agendada para ${appointment.date.toLocaleString('pt-BR')}.`;
  }

  private buildAppointmentReminderBody(
    appointment: AppointmentWithRelations,
    windowLabel: string,
  ): string {
    return `Lembrete: ${appointment.pet.name} tem consulta em ${windowLabel}, em ${appointment.date.toLocaleString('pt-BR')}.`;
  }

  private buildFollowUpBody(appointment: AppointmentWithRelations): string {
    return `Esperamos que a consulta de ${appointment.pet.name} tenha ido bem. Conte com a equipe VetOS AI para o acompanhamento.`;
  }

  private getNotificationJobIds(appointmentId: string) {
    return {
      created: `appt-created-${appointmentId}`,
      reminder24h: `appt-24h-${appointmentId}`,
      reminder2h: `appt-2h-${appointmentId}`,
      followUp: `appt-follow-up-${appointmentId}`,
    };
  }
}

export const appointmentAutomationInclude = {
  pet: {
    include: {
      client: true,
    },
  },
  client: true,
  clinic: true,
} satisfies Prisma.AppointmentInclude;
