import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsAppMockProvider {
  private readonly logger = new Logger(WhatsAppMockProvider.name);

  async sendMessage(to: string, message: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.logger.log(`[WHATSAPP MOCK] To: ${to} | Message: ${message}`);
    return {
      success: true,
      messageId: Math.random().toString(36).substring(7),
    };
  }
}
