import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { BillingWebhookGuard } from './billing-webhook.guard';

describe('BillingWebhookGuard', () => {
  let guard: BillingWebhookGuard;
  const originalEnv = process.env;

  beforeEach(() => {
    guard = new BillingWebhookGuard();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createMockExecutionContext(headers: any, body: any, rawBody?: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          body,
          rawBody,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('rejeita com UnauthorizedException se BILLING_WEBHOOK_SECRET não estiver configurado', () => {
    delete process.env.BILLING_WEBHOOK_SECRET;
    const context = createMockExecutionContext({ 'x-webhook-signature': 'abc' }, {});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejeita com UnauthorizedException se header de assinatura estiver ausente', () => {
    process.env.BILLING_WEBHOOK_SECRET = 'secret123';
    const context = createMockExecutionContext({}, {});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejeita com UnauthorizedException se assinatura for inválida', () => {
    process.env.BILLING_WEBHOOK_SECRET = 'secret123';
    const context = createMockExecutionContext(
      { 'x-webhook-signature': 'invalida' },
      { event: 'payment.success' },
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('permite acesso quando a assinatura HMAC for legítima', () => {
    const secret = 'billing-secret-test';
    process.env.BILLING_WEBHOOK_SECRET = secret;
    const rawBody = JSON.stringify({ event: 'invoice.paid' });
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const context = createMockExecutionContext(
      { 'x-webhook-signature': signature },
      { event: 'invoice.paid' },
      rawBody,
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
