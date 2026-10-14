import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { MetaWebhookController } from './meta-webhook.controller';
import { PrismaService } from '../../prisma/prisma.service';

describe('MetaWebhookController', () => {
  let controller: MetaWebhookController;
  let prisma: PrismaService;

  const mockPrisma = {
    notificationLog: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    process.env.META_WEBHOOK_VERIFY_TOKEN = 'secret_test_token';

    const module: TestingModule = await testModule();
    controller = module.get<MetaWebhookController>(MetaWebhookController);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  async function testModule() {
    return Test.createTestingModule({
      controllers: [MetaWebhookController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();
  }

  describe('GET verifyWebhook', () => {
    it('deve retornar 200 e o challenge quando o token estiver correto', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      controller.verifyWebhook('subscribe', 'secret_test_token', 'challenge_code_123', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith('challenge_code_123');
    });

    it('deve retornar 403 Forbidden quando o token estiver incorreto', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      controller.verifyWebhook('subscribe', 'wrong_token', 'challenge_code_123', res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(res.send).toHaveBeenCalledWith('Forbidden');
    });
  });

  describe('POST handleWebhookPayload', () => {
    it('deve atualizar o NotificationLog para SENT quando status for delivered', async () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  statuses: [
                    {
                      id: 'wamid.HBgLMTIzNDU2',
                      status: 'delivered',
                      timestamp: '1710000000',
                      recipient_id: '5511999999999',
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      mockPrisma.notificationLog.findFirst.mockResolvedValue({
        id: 'log-123',
        status: 'PENDING',
        metaMessageId: 'wamid.HBgLMTIzNDU2',
      });

      const response = await controller.handleWebhookPayload(payload);

      expect(response).toEqual({ status: 'processed' });
      expect(mockPrisma.notificationLog.findFirst).toHaveBeenCalledWith({
        where: { metaMessageId: 'wamid.HBgLMTIzNDU2' },
      });
      expect(mockPrisma.notificationLog.update).toHaveBeenCalledWith({
        where: { id: 'log-123' },
        data: expect.objectContaining({
          status: 'SENT',
        }),
      });
    });

    it('deve atualizar o NotificationLog para FAILED quando status for failed com erro', async () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  statuses: [
                    {
                      id: 'wamid.HBgLMTIzNDU2',
                      status: 'failed',
                      timestamp: '1710000000',
                      errors: [
                        {
                          code: 131047,
                          title: 'Re-engagement message',
                          message: 'More than 24 hours have passed since the recipient last replied.',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      mockPrisma.notificationLog.findFirst.mockResolvedValue({
        id: 'log-123',
        status: 'SENT',
        metaMessageId: 'wamid.HBgLMTIzNDU2',
      });

      const response = await controller.handleWebhookPayload(payload);

      expect(response).toEqual({ status: 'processed' });
      expect(mockPrisma.notificationLog.update).toHaveBeenCalledWith({
        where: { id: 'log-123' },
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: 'Meta Error [131047]: Re-engagement message',
        }),
      });
    });
  });
});
