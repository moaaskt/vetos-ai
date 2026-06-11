export class UpdateNotificationConfigDto {
  emailEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
  whatsappEnabled?: boolean;
  whatsappInstanceUrl?: string;
  whatsappInstanceName?: string;
  whatsappApiKey?: string;
}
