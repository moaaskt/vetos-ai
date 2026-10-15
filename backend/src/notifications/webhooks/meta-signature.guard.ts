import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class MetaSignatureGuard implements CanActivate {
  private readonly logger = new Logger(MetaSignatureGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const signature = req.headers['x-hub-signature-256'] as string;
    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret) {
      this.logger.error(
        'Webhook Meta rejeitado: META_APP_SECRET não configurado no servidor.',
      );
      throw new UnauthorizedException(
        'Webhook signature verification failed: server secret not configured',
      );
    }

    if (!signature) {
      this.logger.warn('Webhook Meta rejeitado: Header X-Hub-Signature-256 ausente.');
      throw new UnauthorizedException('Missing X-Hub-Signature-256 header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.error('Webhook Meta rejeitado: rawBody não disponível.');
      throw new UnauthorizedException('Raw request body is required for signature validation');
    }

    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex')}`;

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      this.logger.warn('Webhook Meta rejeitado: Assinatura HMAC inválida.');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
