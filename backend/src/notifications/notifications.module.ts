import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { EmailMockProvider } from './providers/email-mock.provider';
import { SmtpProvider } from './providers/smtp.provider';
import { WhatsAppMockProvider } from './providers/whatsapp-mock.provider';
import { MetaCloudApiProvider } from './providers/meta-cloud-api.provider';
import { TemplateService } from './template.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { NotificationsController } from './notifications.controller';
import { MetaWebhookController } from './webhooks/meta-webhook.controller';

@Module({
  imports: [
    EncryptionModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController, MetaWebhookController],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    TemplateService,
    EmailMockProvider,
    SmtpProvider,
    WhatsAppMockProvider,
    MetaCloudApiProvider,
  ],
  exports: [
    NotificationsService,
    TemplateService,
    SmtpProvider,
    MetaCloudApiProvider,
  ],
})
export class NotificationsModule {}
