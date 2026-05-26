import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { WhatsAppMockProvider } from './whatsapp-mock.provider';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    WhatsAppMockProvider,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
