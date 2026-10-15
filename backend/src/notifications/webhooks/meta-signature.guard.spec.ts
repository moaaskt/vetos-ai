import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { MetaSignatureGuard } from './meta-signature.guard';

describe('MetaSignatureGuard', () => {
  let guard: MetaSignatureGuard;
  const originalEnv = process.env;

  beforeEach(() => {
    guard = new MetaSignatureGuard();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function createMockExecutionContext(headers: any, rawBody?: Buffer | string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          rawBody,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('rejeita com UnauthorizedException se META_APP_SECRET não estiver configurado', () => {
    delete process.env.META_APP_SECRET;
    const context = createMockExecutionContext({ 'x-hub-signature-256': 'sha256=abc' }, 'body');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejeita com UnauthorizedException se header de assinatura estiver ausente', () => {
    process.env.META_APP_SECRET = 'secret123';
    const context = createMockExecutionContext({}, 'body');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejeita com UnauthorizedException se assinatura for inválida', () => {
    process.env.META_APP_SECRET = 'secret123';
    const context = createMockExecutionContext(
      { 'x-hub-signature-256': 'sha256=invalida' },
      'body',
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('permite acesso quando a assinatura HMAC SHA-256 for legítima', () => {
    const secret = 'test-meta-app-secret';
    process.env.META_APP_SECRET = secret;
    const body = JSON.stringify({ entry: [{ id: '123' }] });
    const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');

    const context = createMockExecutionContext(
      { 'x-hub-signature-256': `sha256=${hmac}` },
      body,
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
