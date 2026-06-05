import { Injectable, Logger } from '@nestjs/common';

export interface EmailMockPayload {
  to: string;
  subject?: string;
  body: string;
}

@Injectable()
export class EmailMockProvider {
  private readonly logger = new Logger(EmailMockProvider.name);

  async send(payload: EmailMockPayload) {
    this.logger.log(
      `[EMAIL MOCK] To: ${payload.to} | Subject: ${payload.subject ?? '(no subject)'} | Body: ${payload.body}`,
    );

    return {
      success: true,
      providerMessageId: `email_mock_${Date.now()}`,
    };
  }
}
