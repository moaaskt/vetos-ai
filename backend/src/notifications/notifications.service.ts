import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue('notifications') private notificationsQueue: Queue) {}

  async enqueueNotification(to: string, message: string) {
    await this.notificationsQueue.add('send-message', {
      to,
      message,
    });
  }
}
