import { createTransport } from 'nodemailer';
import { EncryptionService } from '../../encryption/encryption.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SmtpProvider } from './smtp.provider';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('SmtpProvider', () => {
  let provider: SmtpProvider;

  const prisma = {
    notificationConfig: {
      findUnique: jest.fn(),
    },
  };
  const encryptionService = {
    decrypt: jest.fn(),
  };
  const transporter = {
    sendMail: jest.fn(),
    verify: jest.fn(),
  };
  const createTransportMock = createTransport as jest.Mock;

  beforeEach(() => {
    prisma.notificationConfig.findUnique.mockReset();
    encryptionService.decrypt.mockReset();
    transporter.sendMail.mockReset();
    transporter.verify.mockReset();
    createTransportMock.mockReset();
    createTransportMock.mockReturnValue(transporter);
    encryptionService.decrypt.mockReturnValue('decrypted-password');

    provider = new SmtpProvider(
      prisma as unknown as PrismaService,
      encryptionService as unknown as EncryptionService,
    );
  });

  it('sends email using decrypted per-clinic SMTP config', async () => {
    prisma.notificationConfig.findUnique.mockResolvedValue({
      emailEnabled: true,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: 'smtp-user',
      smtpPasswordEncrypted: 'encrypted-password',
      smtpFromName: 'VetOS AI',
      smtpFromEmail: 'noreply@example.com',
    });
    transporter.sendMail.mockResolvedValue({ messageId: 'message-1' });

    const result = await provider.send({
      clinicId: 'clinic-1',
      to: 'client@example.com',
      subject: 'Consulta',
      body: 'Mensagem',
    });

    expect(prisma.notificationConfig.findUnique).toHaveBeenCalledWith({
      where: { clinicId: 'clinic-1' },
    });
    expect(encryptionService.decrypt).toHaveBeenCalledWith(
      'encrypted-password',
    );
    expect(createTransportMock).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'smtp-user',
        pass: 'decrypted-password',
      },
    });
    expect(transporter.sendMail).toHaveBeenCalledWith({
      from: '"VetOS AI" <noreply@example.com>',
      to: 'client@example.com',
      subject: 'Consulta',
      text: 'Mensagem',
      html: 'Mensagem',
    });
    expect(result).toEqual({
      success: true,
      providerMessageId: 'message-1',
    });
  });

  it('verifies SMTP connections', async () => {
    prisma.notificationConfig.findUnique.mockResolvedValue({
      emailEnabled: true,
      smtpHost: 'smtp.example.com',
      smtpPort: 465,
      smtpUser: 'smtp-user',
      smtpPasswordEncrypted: 'encrypted-password',
      smtpFromName: null,
      smtpFromEmail: 'noreply@example.com',
    });
    transporter.verify.mockResolvedValue(true);

    await expect(provider.testConnection('clinic-1')).resolves.toEqual({
      success: true,
    });

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ secure: true }),
    );
    expect(transporter.verify).toHaveBeenCalled();
  });

  it('sends a test email through the configured SMTP account', async () => {
    prisma.notificationConfig.findUnique.mockResolvedValue({
      emailEnabled: true,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: 'smtp-user',
      smtpPasswordEncrypted: 'encrypted-password',
      smtpFromName: null,
      smtpFromEmail: 'noreply@example.com',
    });
    transporter.sendMail.mockResolvedValue({ messageId: 'test-message' });

    await provider.sendTestEmail({
      clinicId: 'clinic-1',
      to: 'admin@example.com',
    });

    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'noreply@example.com',
        to: 'admin@example.com',
        subject: 'VetOS AI - teste SMTP',
      }),
    );
  });

  it('throws sanitized errors for SMTP operation failures', async () => {
    prisma.notificationConfig.findUnique.mockResolvedValue({
      emailEnabled: true,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: 'smtp-user',
      smtpPasswordEncrypted: 'encrypted-password',
      smtpFromName: null,
      smtpFromEmail: 'noreply@example.com',
    });
    transporter.sendMail.mockRejectedValue(new Error('bad secret password'));

    await expect(
      provider.send({
        clinicId: 'clinic-1',
        to: 'client@example.com',
        body: 'Mensagem',
      }),
    ).rejects.toThrow('SMTP operation failed');
  });
});
