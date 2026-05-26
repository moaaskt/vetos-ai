import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsProcessor } from './notifications.processor';
import { SmtpProvider } from './providers/smtp.provider';
import { WhatsAppMockProvider } from './providers/whatsapp-mock.provider';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsProcessor', () => {
  let processor: NotificationsProcessor;

  const prisma = {
    notificationLog: {
      create: jest.fn(),
    },
  };
  const smtpProvider = {
    send: jest.fn(),
  };
  const whatsappProvider = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    prisma.notificationLog.create.mockReset();
    smtpProvider.send.mockReset();
    whatsappProvider.send.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsProcessor,
        { provide: PrismaService, useValue: prisma },
        { provide: SmtpProvider, useValue: smtpProvider },
        { provide: WhatsAppMockProvider, useValue: whatsappProvider },
      ],
    }).compile();

    processor = module.get(NotificationsProcessor);
  });

  it('routes EMAIL jobs and records a sent log', async () => {
    smtpProvider.send.mockResolvedValue({
      success: true,
      providerMessageId: 'email-1',
    });

    await processor.process({
      id: 'job-1',
      name: 'send-message',
      data: {
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
        subject: 'Consulta',
        body: 'Mensagem',
        event: 'APPOINTMENT_CREATED',
      },
    } as any);

    expect(smtpProvider.send).toHaveBeenCalledWith({
      clinicId: 'clinic-1',
      to: 'client@example.com',
      subject: 'Consulta',
      body: 'Mensagem',
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
        status: 'SENT',
        providerMessageId: 'email-1',
      }),
    });
  });

  it('routes WHATSAPP jobs and records a sent log', async () => {
    whatsappProvider.send.mockResolvedValue({
      success: true,
      providerMessageId: 'whatsapp-1',
    });

    await processor.process({
      id: 'job-2',
      name: 'send-message',
      data: {
        clinicId: 'clinic-1',
        channel: 'WHATSAPP',
        to: '+5511999999999',
        body: 'Mensagem',
        event: 'APPOINTMENT_CREATED',
      },
    } as any);

    expect(whatsappProvider.send).toHaveBeenCalledWith({
      to: '+5511999999999',
      body: 'Mensagem',
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: 'clinic-1',
        channel: 'WHATSAPP',
        status: 'SENT',
        providerMessageId: 'whatsapp-1',
      }),
    });
  });
});
