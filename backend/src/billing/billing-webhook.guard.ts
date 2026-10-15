import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class BillingWebhookGuard implements CanActivate {
  private readonly logger = new Logger(BillingWebhookGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const signature = req.headers['x-webhook-signature'] as string;
    const webhookSecret = process.env.BILLING_WEBHOOK_SECRET;

    if (!webhookSecret) {
      this.logger.error(
        'Billing Webhook rejeitado: BILLING_WEBHOOK_SECRET não configurado no servidor.',
      );
      throw new UnauthorizedException(
        'Billing webhook verification failed: server secret not configured',
      );
    }

    if (!signature) {
      this.logger.warn('Billing Webhook rejeitado: Header x-webhook-signature ausente.');
      throw new UnauthorizedException('Missing x-webhook-signature header');
    }

    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      this.logger.warn('Billing Webhook rejeitado: Assinatura inválida.');
      throw new UnauthorizedException('Invalid billing webhook signature');
    }

    return true;
  }
}
