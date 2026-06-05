import { BadRequestException } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  const prisma = {
    notificationLog: {
      create: jest.fn(),
    },
  };
  const smtpProvider = {
    sendTestEmail: jest.fn(),
  };
  const evolutionApiProvider = {
    send: jest.fn(),
  };

  let controller: NotificationsController;

  beforeEach(() => {
    prisma.notificationLog.create.mockReset();
    smtpProvider.sendTestEmail.mockReset();
    evolutionApiProvider.send.mockReset();

    controller = new NotificationsController(
      prisma as any,
      smtpProvider as any,
      {} as any,
      {} as any,
      evolutionApiProvider as any,
    );
  });

  it('send-test-email creates a SENT NotificationLog', async () => {
    smtpProvider.sendTestEmail.mockResolvedValue({
      success: true,
      providerMessageId: 'email-test-1',
    });

    const result = await controller.sendTestEmail(
      { clinicId: 'clinic-1' },
      'client@example.com',
    );

    expect(result).toEqual({
      success: true,
      providerMessageId: 'email-test-1',
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
        event: 'TEST_EMAIL',
        status: 'SENT',
        providerMessageId: 'email-test-1',
      }),
    });
  });

  it('send-test-whatsapp creates a SENT NotificationLog', async () => {
    evolutionApiProvider.send.mockResolvedValue({
      success: true,
      providerMessageId: 'whatsapp-test-1',
    });

    const result = await controller.sendTestWhatsapp(
      { clinicId: 'clinic-1' },
      '+5511999999999',
    );

    expect(result).toEqual({
      success: true,
      providerMessageId: 'whatsapp-test-1',
    });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clinicId: 'clinic-1',
        channel: 'WHATSAPP',
        to: '+5511999999999',
        event: 'TEST_WHATSAPP',
        status: 'SENT',
        providerMessageId: 'whatsapp-test-1',
      }),
    });
  });

  it('does not create test log when recipient is missing', async () => {
    await expect(
      controller.sendTestEmail({ clinicId: 'clinic-1' }, ''),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.notificationLog.create).not.toHaveBeenCalled();
  });
});
