import { Test, TestingModule } from '@nestjs/testing';
import { EvolutionApiProvider } from './evolution-api.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';

describe('EvolutionApiProvider', () => {
  let provider: EvolutionApiProvider;

  const prisma = {
    notificationConfig: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const encryptionService = {
    decrypt: jest.fn(),
  };

  let fetchMock: jest.SpyInstance;

  beforeEach(async () => {
    prisma.notificationConfig.findUnique.mockReset();
    prisma.notificationConfig.update.mockReset();
    encryptionService.decrypt.mockReset();

    // Mock do fetch global
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvolutionApiProvider,
        { provide: PrismaService, useValue: prisma },
        { provide: EncryptionService, useValue: encryptionService },
      ],
    }).compile();

    provider = module.get<EvolutionApiProvider>(EvolutionApiProvider);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  describe('send', () => {
    it('should send a message via fetch and format number correctly', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappEnabled: true,
        whatsappInstanceUrl: 'https://api.evolution.com',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });

      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          key: {
            id: 'wa-msg-123',
          },
        }),
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await provider.send({
        clinicId: 'clinic-123',
        to: '(11) 99999-9999',
        body: 'Olá, teste de envio',
      });

      expect(prisma.notificationConfig.findUnique).toHaveBeenCalledWith({
        where: { clinicId: 'clinic-123' },
      });
      expect(encryptionService.decrypt).toHaveBeenCalledWith('encrypted_api_key');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.evolution.com/message/sendText/instancia_teste',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: 'decrypted_api_key',
          },
          body: JSON.stringify({
            number: '5511999999999',
            text: 'Olá, teste de envio',
          }),
        }),
      );
      expect(result).toEqual({
        success: true,
        providerMessageId: 'wa-msg-123',
      });
    });

    it('should throw an error if fetch fails', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappEnabled: true,
        whatsappInstanceUrl: 'https://api.evolution.com/',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });

      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: jest.fn().mockResolvedValue('Invalid number'),
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      await expect(
        provider.send({
          clinicId: 'clinic-123',
          to: '11999999999',
          body: 'Teste',
        }),
      ).rejects.toThrow('Evolution API failed to send message: Bad Request');
    });
  });

  describe('testConnection', () => {
    it('should verify connection status and return success if open', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappEnabled: true,
        whatsappInstanceUrl: 'https://api.evolution.com',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });

      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          instance: {
            state: 'open',
          },
        }),
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await provider.testConnection('clinic-123');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.evolution.com/instance/connectionState/instancia_teste',
        expect.objectContaining({
          method: 'GET',
          headers: {
            apikey: 'decrypted_api_key',
          },
        }),
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if state is not open', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappEnabled: true,
        whatsappInstanceUrl: 'https://api.evolution.com',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });

      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          instance: {
            state: 'connecting',
          },
        }),
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      await expect(provider.testConnection('clinic-123')).rejects.toThrow(
        'WhatsApp instance is disconnected (State: connecting)',
      );
    });
  });

  describe('createInstance', () => {
    it('should call fetch to create instance and return success', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappInstanceUrl: 'https://api.evolution.com',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });
      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ instance: { instanceName: 'instancia_teste' } }),
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await provider.createInstance('clinic-123');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.evolution.com/instance/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            instanceName: 'instancia_teste',
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
          }),
        }),
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getQrCode', () => {
    it('should call fetch and return base64 qr code', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappInstanceUrl: 'https://api.evolution.com',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });
      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          base64: 'data:image/png;base64,qrcode...',
          code: 'qrcode_string_code',
        }),
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await provider.getQrCode('clinic-123');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.evolution.com/instance/connect/instancia_teste',
        expect.any(Object),
      );
      expect(result).toEqual({
        success: true,
        base64: 'data:image/png;base64,qrcode...',
        pairingCode: undefined,
        code: 'qrcode_string_code',
      });
    });
  });

  describe('getConnectionStatus', () => {
    it('should call fetch and return status state', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappInstanceUrl: 'https://api.evolution.com',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });
      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          instance: {
            state: 'open',
          },
        }),
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await provider.getConnectionStatus('clinic-123');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.evolution.com/instance/connectionState/instancia_teste',
        expect.any(Object),
      );
      expect(result).toEqual({
        success: true,
        state: 'open',
      });
    });
  });

  describe('deleteInstance', () => {
    it('should call fetch DELETE and clear config in database', async () => {
      prisma.notificationConfig.findUnique.mockResolvedValue({
        whatsappInstanceUrl: 'https://api.evolution.com',
        whatsappInstanceName: 'instancia_teste',
        whatsappApiKeyEncrypted: 'encrypted_api_key',
      });
      encryptionService.decrypt.mockReturnValue('decrypted_api_key');

      const mockResponse = {
        ok: true,
      };
      fetchMock.mockResolvedValue(mockResponse as any);

      const result = await provider.deleteInstance('clinic-123');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.evolution.com/instance/delete/instancia_teste',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(prisma.notificationConfig.update).toHaveBeenCalledWith({
        where: { clinicId: 'clinic-123' },
        data: {
          whatsappEnabled: false,
          whatsappInstanceUrl: null,
          whatsappInstanceName: null,
          whatsappApiKeyEncrypted: null,
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
