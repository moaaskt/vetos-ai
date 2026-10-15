import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ReengagementService } from './reengagement.service';
import { PrismaService } from '../prisma/prisma.service';
import { GroqService } from './groq.service';
import { PromptSanitizerService } from './prompt-sanitizer.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BillingService } from '../billing/billing.service';

describe('ReengagementService', () => {
  let service: ReengagementService;
  let prismaService: jest.Mocked<PrismaService>;
  let groqService: jest.Mocked<GroqService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let billingService: jest.Mocked<BillingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReengagementService,
        PromptSanitizerService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            clinic: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: GroqService,
          useValue: {
            chatCompletion: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            enqueueNotification: jest.fn(),
          },
        },
        {
          provide: BillingService,
          useValue: {
            assertCanSendNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReengagementService>(ReengagementService);
    prismaService = module.get(PrismaService);
    groqService = module.get(GroqService);
    notificationsService = module.get(NotificationsService);
    billingService = module.get(BillingService);
  });

  describe('findInactiveClients', () => {
    it('deve retornar candidatos inativos sem consulta há mais de 90 dias', async () => {
      const past120Days = new Date();
      past120Days.setDate(past120Days.getDate() - 120);

      (prismaService.client.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'c-1',
          name: 'Renata',
          phone: '11988887777',
          whatsapp: '11988887777',
          email: 'renata@test.com',
          createdAt: past120Days,
          pets: [{ id: 'p-1', name: 'Pipoca', species: 'Canina', breed: 'Poodle' }],
          appointments: [{ date: past120Days, reason: 'Vacina' }],
        },
        {
          id: 'c-2', // Consulta recente: deve ser ignorado
          name: 'Lucas',
          phone: '11977776666',
          createdAt: new Date(),
          pets: [{ id: 'p-2', name: 'Max', species: 'Canina', breed: 'SRD' }],
          appointments: [{ date: new Date(), reason: 'Consulta' }],
        },
      ]);

      const candidates = await service.findInactiveClients('clinic-1');

      expect(candidates.length).toBe(1);
      expect(candidates[0].clientId).toBe('c-1');
      expect(candidates[0].clientName).toBe('Renata');
      expect(candidates[0].petName).toBe('Pipoca');
      expect(candidates[0].daysInactive).toBeGreaterThanOrEqual(119);
    });
  });

  describe('processClinicReengagementBatch', () => {
    it('deve processar e enfileirar mensagens e atualizar lastReengagementAt', async () => {
      const past100Days = new Date();
      past100Days.setDate(past100Days.getDate() - 100);

      (prismaService.client.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'c-1',
          name: 'Carlos',
          phone: '11999998888',
          whatsapp: '11999998888',
          email: 'carlos@test.com',
          createdAt: past100Days,
          pets: [{ id: 'p-1', name: 'Thor', species: 'Canina', breed: 'Labrador' }],
          appointments: [{ date: past100Days, reason: 'Checkup' }],
        },
      ]);

      billingService.assertCanSendNotification.mockResolvedValue(undefined);
      groqService.chatCompletion.mockResolvedValue(
        'Olá, {{clientName}}! Que saudades do {{petName}}! Agende um checkup.',
      );

      const batch = await service.processClinicReengagementBatch('clinic-1');

      expect(batch.enqueuedCount).toBe(1);
      expect(billingService.assertCanSendNotification).toHaveBeenCalledWith('clinic-1');
      expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: 'clinic-1',
          channel: 'WHATSAPP',
          event: 'RETENTION',
          body: 'Olá, Carlos! Que saudades do Thor! Agende um checkup.',
        }),
      );
      expect(prismaService.client.update).toHaveBeenCalledWith({
        where: { id: 'c-1' },
        data: { lastReengagementAt: expect.any(Date) },
      });
    });

    it('deve interromper o lote se a cota do plano for atingida', async () => {
      const past100Days = new Date();
      past100Days.setDate(past100Days.getDate() - 100);

      (prismaService.client.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'c-1',
          name: 'Carlos',
          phone: '11999998888',
          whatsapp: '11999998888',
          createdAt: past100Days,
          pets: [{ id: 'p-1', name: 'Thor', species: 'Canina', breed: 'Labrador' }],
          appointments: [{ date: past100Days }],
        },
      ]);

      billingService.assertCanSendNotification.mockRejectedValue(
        new ForbiddenException('Cota mensal de notificações atingida'),
      );

      const batch = await service.processClinicReengagementBatch('clinic-1');

      expect(batch.enqueuedCount).toBe(0);
      expect(batch.skippedQuotaCount).toBe(1);
      expect(notificationsService.enqueueNotification).not.toHaveBeenCalled();
    });
  });
});
