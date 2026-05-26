import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
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
      throw error;
    }
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
}
