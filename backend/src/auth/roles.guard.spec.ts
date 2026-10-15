import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(user: any): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('deve permitir acesso quando não há roles requeridas (público / sem restrição de papel)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockExecutionContext({ role: Role.STAFF });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve permitir acesso quando o usuário possui uma das roles requeridas', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPERADMIN]);
    const context = createMockExecutionContext({ role: Role.SUPERADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve lançar ForbiddenException quando o usuário não possui a role requerida', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPERADMIN]);
    const context = createMockExecutionContext({ role: Role.STAFF });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException quando o usuário for ADMIN e a rota exigir SUPERADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.SUPERADMIN]);
    const context = createMockExecutionContext({ role: Role.ADMIN });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException quando req.user não existir ou não tiver role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockExecutionContext(null);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
