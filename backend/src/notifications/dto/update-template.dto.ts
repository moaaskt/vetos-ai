import { NotificationChannel } from '@prisma/client';

export class UpdateNotificationTemplateDto {
  event!: string;
  channel!: NotificationChannel;
  subject?: string;
  body!: string;
  metaTemplateName?: string;
  metaTemplateLang?: string;
  active!: boolean;
}
