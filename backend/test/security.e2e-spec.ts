import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import helmet from 'helmet';

describe('Security & RBAC (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet());
    await app.init();

    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Headers de Segurança HTTP (Helmet)', () => {
    it('deve incluir cabeçalhos do Helmet (ex: X-Content-Type-Options)', async () => {
      const response = await request(app.getHttpServer()).get('/');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Autenticação e Proteção de Rotas', () => {
    it('deve rejeitar acesso a /billing/subscription sem token com 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/billing/subscription')
        .expect(401);
    });

    it('deve rejeitar acesso a /billing/change-plan sem token com 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/billing/change-plan')
        .send({ planId: 'any-plan' })
        .expect(401);
    });
  });

  describe('Webhooks Fail-Closed (HMAC Signatures)', () => {
    it('deve rejeitar POST /webhooks/meta-whatsapp sem assinatura com 401', async () => {
      await request(app.getHttpServer())
        .post('/webhooks/meta-whatsapp')
        .send({ entry: [] })
        .expect(401);
    });

    it('deve rejeitar POST /billing/webhook sem assinatura com 401', async () => {
      await request(app.getHttpServer())
        .post('/billing/webhook')
        .send({ event: 'invoice.payment_succeeded' })
        .expect(401);
    });
  });

  describe('RBAC em /billing/change-plan', () => {
    it('deve bloquear usuário com role STAFF com 403 Forbidden', async () => {
      const staffToken = jwtService.sign(
        {
          sub: 'user-staff-1',
          email: 'staff@vetos.test',
          role: Role.STAFF,
          clinicId: 'clinic-1',
        },
        { secret: process.env.JWT_SECRET || 'super-secret-dev-key' },
      );

      await request(app.getHttpServer())
        .post('/billing/change-plan')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ planId: 'plan-pro' })
        .expect(403);
    });

    it('deve bloquear usuário com role ADMIN com 403 Forbidden (change-plan restrito a SUPERADMIN)', async () => {
      const adminToken = jwtService.sign(
        {
          sub: 'user-admin-1',
          email: 'admin@vetos.test',
          role: Role.ADMIN,
          clinicId: 'clinic-1',
        },
        { secret: process.env.JWT_SECRET || 'super-secret-dev-key' },
      );

      await request(app.getHttpServer())
        .post('/billing/change-plan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ planId: 'plan-pro' })
        .expect(403);
    });
  });
});
