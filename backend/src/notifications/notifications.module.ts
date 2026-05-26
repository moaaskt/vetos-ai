import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { EmailMockProvider } from './providers/email-mock.provider';
import { WhatsAppMockProvider } from './providers/whatsapp-mock.provider';
import { TemplateService } from './template.service';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [
    EncryptionModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    TemplateService,
    EmailMockProvider,
    WhatsAppMockProvider,
  ],
  exports: [NotificationsService, TemplateService],
})
export class NotificationsModule {}
