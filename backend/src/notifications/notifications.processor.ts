import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SmtpProvider } from './providers/smtp.provider';
import { WhatsAppMockProvider } from './providers/whatsapp-mock.provider';
import { EnqueueNotificationInput } from './notifications.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smtpProvider: SmtpProvider,
    private readonly whatsappProvider: WhatsAppMockProvider,
  ) {
    super();
  }

  async process(job: Job<EnqueueNotificationInput, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      const validation = await this.validateBeforeSend(job.data);

      if (!validation.shouldSend) {
        this.logger.log(
          `Skipping notification job ${job.id}: ${validation.reason}`,
        );
        return validation;
      }

      const result = await this.send(job.data);
      await this.createNotificationLog(
        job.data,
        'SENT',
        result.providerMessageId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to send notification for job ${job.id}`, error);
      await this.createNotificationLog(
        job.data,
        'FAILED',
        undefined,
        error instanceof Error ? error.message : 'Unknown notification error',
      );

      if (this.isGracefulConfigurationFailure(error)) {
        return {
          success: false,
          skipped: true,
          reason:
            error instanceof Error ? error.message : 'Configuration error',
        };
      }

      throw error;
    }
  }

  private async validateBeforeSend(
    payload: EnqueueNotificationInput,
  ): Promise<{ shouldSend: boolean; reason?: string }> {
    if (!this.isAppointmentAutomationEvent(payload.event)) {
      return { shouldSend: true };
    }

    if (!payload.appointmentId) {
      return { shouldSend: true };
    }

    if (this.requiresAppointmentDeduplication(payload.event)) {
      const existingLog = await this.prisma.notificationLog.findFirst({
        where: {
          clinicId: payload.clinicId,
          event: payload.event,
          appointmentId: payload.appointmentId,
          status: 'SENT',
        },
      });

      if (existingLog) {
        return {
          shouldSend: false,
          reason: `notification already sent for ${payload.event}`,
        };
      }
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: payload.appointmentId,
        clinicId: payload.clinicId,
      },
      include: {
        client: true,
        pet: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!appointment) {
      return { shouldSend: false, reason: 'appointment no longer exists' };
    }

    if (
      payload.appointmentDate &&
      appointment.date.getTime() !== new Date(payload.appointmentDate).getTime()
    ) {
      return { shouldSend: false, reason: 'appointment date changed' };
    }

    if (
      payload.event === 'APPOINTMENT_FOLLOW_UP' &&
      appointment.status !== AppointmentStatus.COMPLETED
    ) {
      return {
        shouldSend: false,
        reason: 'appointment is not completed',
      };
    }

    if (
      payload.event !== 'APPOINTMENT_FOLLOW_UP' &&
      appointment.status !== AppointmentStatus.SCHEDULED
    ) {
      return {
        shouldSend: false,
        reason: 'appointment is not scheduled',
      };
    }

    const client = appointment.client ?? appointment.pet.client;
    const hasContact =
      payload.channel === 'EMAIL'
        ? Boolean(client.email)
        : Boolean(client.phone);

    if (!hasContact) {
      return {
        shouldSend: false,
        reason: 'client has no contact info for notification channel',
      };
    }

    return { shouldSend: true };
  }

  private async send(payload: EnqueueNotificationInput) {
    if (payload.channel === 'EMAIL') {
      if (!payload.clinicId) {
        throw new Error('clinicId is required for SMTP email notifications');
      }

      return this.smtpProvider.send({
        clinicId: payload.clinicId,
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
      });
    }

    return this.whatsappProvider.send({
      to: payload.to,
      body: payload.body,
    });
  }

  private async createNotificationLog(
    payload: EnqueueNotificationInput,
    status: 'SENT' | 'FAILED',
    providerMessageId?: string,
    errorMessage?: string,
  ): Promise<void> {
    if (!payload.clinicId) {
      this.logger.warn(
        `Skipping NotificationLog for ${payload.channel} notification without clinicId`,
      );
      return;
    }

    await this.prisma.notificationLog.create({
      data: {
        clinicId: payload.clinicId,
        channel: payload.channel,
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
        status,
        errorMessage,
        providerMessageId,
        event: payload.event,
        scheduledFor: payload.scheduledFor,
        sentAt: status === 'SENT' ? new Date() : undefined,
        appointmentId: payload.appointmentId,
        clientId: payload.clientId,
        petId: payload.petId,
      },
    });
  }

  private isAppointmentAutomationEvent(event: string): boolean {
    return [
      'APPOINTMENT_CREATED',
      'APPOINTMENT_REMINDER_24H',
      'APPOINTMENT_REMINDER_2H',
      'APPOINTMENT_FOLLOW_UP',
    ].includes(event);
  }

  private requiresAppointmentDeduplication(event: string): boolean {
    return [
      'APPOINTMENT_REMINDER_24H',
      'APPOINTMENT_REMINDER_2H',
      'APPOINTMENT_FOLLOW_UP',
    ].includes(event);
  }

  private isGracefulConfigurationFailure(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return [
      'clinicId is required for SMTP email notifications',
      'SMTP configuration is not enabled for this clinic',
      'SMTP configuration is incomplete for this clinic',
    ].includes(error.message);
  }
}
