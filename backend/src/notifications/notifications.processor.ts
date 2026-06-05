import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SmtpProvider } from './providers/smtp.provider';
import { WhatsAppMockProvider } from './providers/whatsapp-mock.provider';
import { EvolutionApiProvider } from './providers/evolution-api.provider';
import { EnqueueNotificationInput } from './notifications.service';
import { TemplateService } from './template.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smtpProvider: SmtpProvider,
    private readonly whatsappProvider: WhatsAppMockProvider,
    private readonly templateService: TemplateService,
    private readonly evolutionApiProvider: EvolutionApiProvider,
  ) {
    super();
  }

  async process(job: Job<EnqueueNotificationInput, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    let compiledSubject = job.data.subject;
    let compiledBody = job.data.body;

    try {
      const validation = await this.validateBeforeSend(job.data);

      if (!validation.shouldSend) {
        this.logger.log(
          `Skipping notification job ${job.id}: ${validation.reason}`,
        );
        return validation;
      }

      const resolved = await this.resolveSubjectAndBody(job.data);
      compiledSubject = resolved.subject;
      compiledBody = resolved.body;

      const result = await this.send(job.data, compiledSubject, compiledBody);
      await this.createNotificationLog(
        job.data,
        compiledSubject,
        compiledBody,
        'SENT',
        result.providerMessageId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to send notification for job ${job.id}`, error);
      await this.createNotificationLog(
        job.data,
        compiledSubject,
        compiledBody,
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
          channel: payload.channel,
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
      throw new Error(this.getMissingContactMessage(payload.channel));
    }

    return { shouldSend: true };
  }

  private getMissingContactMessage(channel: 'EMAIL' | 'WHATSAPP'): string {
    return channel === 'EMAIL'
      ? 'Client has no email for email notification'
      : 'Client has no phone for WhatsApp notification';
  }

  private async resolveSubjectAndBody(
    jobData: EnqueueNotificationInput,
  ): Promise<{ subject?: string; body: string }> {
    if (!jobData.clinicId) {
      return { subject: jobData.subject, body: jobData.body };
    }

    const template = await this.prisma.notificationTemplate.findUnique({
      where: {
        clinicId_event_channel: {
          clinicId: jobData.clinicId,
          event: jobData.event,
          channel: jobData.channel,
        },
      },
    });

    if (template && template.active) {
      const compilePayload: Record<string, any> = {
        clientName: jobData.clientName || '',
        petName: jobData.petName || '',
        appointmentDate: jobData.appointmentDate
          ? new Date(jobData.appointmentDate).toLocaleString('pt-BR')
          : '',
        clinicName: jobData.clinicName || '',
      };

      const body = this.templateService.compile(template.body, compilePayload);
      const subject = template.subject
        ? this.templateService.compile(template.subject, compilePayload)
        : undefined;

      return { subject, body };
    }

    return { subject: jobData.subject, body: jobData.body };
  }

  private async send(
    payload: EnqueueNotificationInput,
    subject: string | undefined,
    body: string,
  ) {
    if (payload.channel === 'EMAIL') {
      if (!payload.clinicId) {
        throw new Error('clinicId is required for SMTP email notifications');
      }

      return this.smtpProvider.send({
        clinicId: payload.clinicId,
        to: payload.to,
        subject: subject,
        body: body,
      });
    }

    if (payload.clinicId) {
      const config = await this.prisma.notificationConfig.findUnique({
        where: { clinicId: payload.clinicId },
      });

      if (
        config &&
        config.whatsappEnabled &&
        config.whatsappInstanceUrl &&
        config.whatsappInstanceName &&
        config.whatsappApiKeyEncrypted
      ) {
        return this.evolutionApiProvider.send({
          clinicId: payload.clinicId,
          to: payload.to,
          body,
        });
      }
    }

    return this.whatsappProvider.send({
      to: payload.to,
      body: body,
    });
  }

  private async createNotificationLog(
    payload: EnqueueNotificationInput,
    subject: string | undefined,
    body: string,
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
        subject,
        body,
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
      'Client has no email for email notification',
      'Client has no phone for WhatsApp notification',
      'WhatsApp configuration is not enabled for this clinic',
      'WhatsApp configuration is incomplete for this clinic',
    ].includes(error.message);
  }
}
