import { WhatsappProvider } from '@prisma/client';

export class UpdateNotificationConfigDto {
  emailEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;

  whatsappEnabled?: boolean;
  whatsappProvider?: WhatsappProvider;
  metaPhoneNumberId?: string;
  metaWabaId?: string;
  metaAccessToken?: string;
}
