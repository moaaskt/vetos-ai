import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WhatsAppMockProvider } from './whatsapp-mock.provider';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private whatsappProvider: WhatsAppMockProvider) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    const { to, message } = job.data;

    try {
      await this.whatsappProvider.sendMessage(to, message);
    } catch (error) {
      this.logger.error(`Failed to send notification for job ${job.id}`, error);
      throw error;
    }
  }
}
