import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export type NotificationChannel = 'EMAIL' | 'WHATSAPP';
export type NotificationEvent =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_REMINDER_24H'
  | 'APPOINTMENT_REMINDER_2H'
  | 'APPOINTMENT_FOLLOW_UP'
  | 'VACCINE_EXPIRATION'
  | 'RETENTION'
  | 'LEGACY_NOTIFICATION'
  | string;

export interface EnqueueNotificationInput {
  clinicId?: string;
  channel: NotificationChannel;
  to: string;
  body: string;
  subject?: string;
  event: NotificationEvent;
  scheduledFor?: Date;
  appointmentDate?: Date | string;
  appointmentId?: string;
  clientId?: string;
  petId?: string;
  delayMs?: number;
  jobId?: string;
  clientName?: string;
  petName?: string;
  clinicName?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async enqueueNotification(to: string, message: string): Promise<void>;
  async enqueueNotification(input: EnqueueNotificationInput): Promise<void>;
  async enqueueNotification(
    inputOrTo: EnqueueNotificationInput | string,
    message?: string,
  ): Promise<void> {
    const payload =
      typeof inputOrTo === 'string'
        ? {
            channel: 'WHATSAPP' as const,
            to: inputOrTo,
            body: message ?? '',
            event: 'LEGACY_NOTIFICATION',
          }
        : inputOrTo;

    await this.notificationsQueue.add('send-message', payload, {
      delay: payload.delayMs,
      jobId: payload.jobId,
    });
  }

  async cancelNotificationJob(jobId: string): Promise<void> {
    const job = await this.notificationsQueue.getJob(jobId);
    await job?.remove();
  }
}
