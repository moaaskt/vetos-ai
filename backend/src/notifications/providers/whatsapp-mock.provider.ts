import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppMockPayload {
  to: string;
  body: string;
}

@Injectable()
export class WhatsAppMockProvider {
  private readonly logger = new Logger(WhatsAppMockProvider.name);

  async send(payload: WhatsAppMockPayload) {
    this.logger.log(
      `[WHATSAPP MOCK] To: ${payload.to} | Body: ${payload.body}`,
    );

    return {
      success: true,
      providerMessageId: `whatsapp_mock_${Date.now()}`,
    };
  }
}
