import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsProcessor } from './notifications.processor';
import { SmtpProvider } from './providers/smtp.provider';
import { WhatsAppMockProvider } from './providers/whatsapp-mock.provider';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateService } from './template.service';

describe('NotificationsProcessor', () => {
  let processor: NotificationsProcessor;

  const prisma = {
    notificationLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    appointment: {
      findFirst: jest.fn(),
    },
    notificationTemplate: {
      findUnique: jest.fn(),
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
    prisma.notificationLog.findFirst.mockReset();
    prisma.appointment.findFirst.mockReset();
    prisma.notificationTemplate.findUnique.mockReset();
    smtpProvider.send.mockReset();
    whatsappProvider.send.mockReset();

    prisma.notificationTemplate.findUnique.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsProcessor,
        TemplateService,
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

  it('skips duplicate appointment reminders before sending', async () => {
    prisma.notificationLog.findFirst.mockResolvedValue({ id: 'log-1' });

    const result = await processor.process({
      id: 'job-3',
      name: 'send-message',
      data: {
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
        subject: 'Consulta',
        body: 'Mensagem',
        event: 'APPOINTMENT_REMINDER_24H',
        appointmentId: 'appointment-1',
      },
    } as any);

    expect(result).toEqual({
      shouldSend: false,
      reason: 'notification already sent for APPOINTMENT_REMINDER_24H',
    });
    expect(smtpProvider.send).not.toHaveBeenCalled();
    expect(prisma.notificationLog.create).not.toHaveBeenCalled();
  });

  it('records missing SMTP configuration as a failed log without throwing', async () => {
    smtpProvider.send.mockRejectedValue(
      new Error('SMTP configuration is incomplete for this clinic'),
    );

    const result = await processor.process({
      id: 'job-4',
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

    expect(result).toEqual({
      success: false,
      skipped: true,
      reason: 'SMTP configuration is incomplete for this clinic',
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        status: 'FAILED',
        errorMessage: 'SMTP configuration is incomplete for this clinic',
      }),
    });
  });

  it('uses active template and replaces placeholders correctly for APPOINTMENT_CREATED EMAIL', async () => {
    smtpProvider.send.mockResolvedValue({
      success: true,
      providerMessageId: 'email-custom-1',
    });

    prisma.notificationTemplate.findUnique.mockResolvedValue({
      id: 'template-1',
      clinicId: 'clinic-1',
      event: 'APPOINTMENT_CREATED',
      channel: 'EMAIL',
      subject: 'Agendamento: {{petName}}',
      body: 'Ola {{clientName}}, a consulta de {{petName}} na clinica {{clinicName}} foi marcada para {{appointmentDate}}.',
      active: true,
    });

    const appointmentDateStr = '2026-06-05T09:00:00.000Z';
    const expectedDateStr = new Date(appointmentDateStr).toLocaleString('pt-BR');

    await processor.process({
      id: 'job-custom-email',
      name: 'send-message',
      data: {
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
        subject: 'Fallback Subject',
        body: 'Fallback Body',
        event: 'APPOINTMENT_CREATED',
        clientName: 'Rafa',
        petName: 'Rex',
        clinicName: 'VetOS',
        appointmentDate: appointmentDateStr,
      },
    } as any);

    const expectedSubject = 'Agendamento: Rex';
    const expectedBody = `Ola Rafa, a consulta de Rex na clinica VetOS foi marcada para ${expectedDateStr}.`;

    expect(smtpProvider.send).toHaveBeenCalledWith({
      clinicId: 'clinic-1',
      to: 'client@example.com',
      subject: expectedSubject,
      body: expectedBody,
    });

    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
        subject: expectedSubject,
        body: expectedBody,
        status: 'SENT',
        providerMessageId: 'email-custom-1',
      }),
    });
  });

  it('uses fallback subject/body when template is inactive', async () => {
    smtpProvider.send.mockResolvedValue({
      success: true,
      providerMessageId: 'email-fallback-1',
    });

    prisma.notificationTemplate.findUnique.mockResolvedValue({
      id: 'template-1',
      clinicId: 'clinic-1',
      event: 'APPOINTMENT_CREATED',
      channel: 'EMAIL',
      subject: 'Agendamento: {{petName}}',
      body: 'Ola {{clientName}}',
      active: false,
    });

    await processor.process({
      id: 'job-inactive-email',
      name: 'send-message',
      data: {
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
        subject: 'Fallback Subject',
        body: 'Fallback Body',
        event: 'APPOINTMENT_CREATED',
      },
    } as any);

    expect(smtpProvider.send).toHaveBeenCalledWith({
      clinicId: 'clinic-1',
      to: 'client@example.com',
      subject: 'Fallback Subject',
      body: 'Fallback Body',
    });
  });
});
