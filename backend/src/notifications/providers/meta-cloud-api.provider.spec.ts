import { Test, TestingModule } from '@nestjs/testing';
import { MetaCloudApiProvider } from './meta-cloud-api.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';

describe('MetaCloudApiProvider', () => {
  let provider: MetaCloudApiProvider;
  let prisma: PrismaService;
  let encryptionService: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetaCloudApiProvider,
        {
          provide: PrismaService,
          useValue: {
            notificationConfig: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: EncryptionService,
          useValue: {
            decrypt: jest.fn().mockReturnValue('decrypted_token_xyz'),
            encrypt: jest.fn().mockReturnValue('encrypted_token_xyz'),
          },
        },
      ],
    }).compile();

    provider = module.get<MetaCloudApiProvider>(MetaCloudApiProvider);
    prisma = module.get<PrismaService>(PrismaService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizePhoneNumber', () => {
    it('deve remover pontuação e caracteres não numéricos', () => {
      expect(provider.normalizePhoneNumber('(11) 98888-7777')).toBe('5511988887777');
      expect(provider.normalizePhoneNumber('+55 (11) 98888-7777')).toBe('5511988887777');
      expect(provider.normalizePhoneNumber('+1 (202) 555-0125')).toBe('12025550125');
    });

    it('deve adicionar o prefixo 55 caso o número nacional tenha 10 ou 11 dígitos', () => {
      expect(provider.normalizePhoneNumber('11999998888')).toBe('5511999998888');
      expect(provider.normalizePhoneNumber('1133334444')).toBe('551133334444');
    });

    it('deve retornar string vazia para telefone vazio', () => {
      expect(provider.normalizePhoneNumber('')).toBe('');
    });
  });

  describe('getCredentials', () => {
    it('deve retornar credenciais da clínica se configuradas e descriptografadas', async () => {
      (prisma.notificationConfig.findUnique as jest.Mock).mockResolvedValue({
        clinicId: 'clinic-1',
        metaPhoneNumberId: 'phone_123',
        metaWabaId: 'waba_456',
        metaAccessTokenEncrypted: 'enc_token',
      });

      const creds = await provider.getCredentials('clinic-1');
      expect(creds.source).toBe('CLINIC');
      expect(creds.phoneNumberId).toBe('phone_123');
      expect(creds.accessToken).toBe('decrypted_token_xyz');
      expect(encryptionService.decrypt).toHaveBeenCalledWith('enc_token');
    });

    it('deve recorrer às credenciais centrais do sistema quando a clínica não tiver configurado', async () => {
      process.env.META_WHATSAPP_PHONE_NUMBER_ID = 'system_phone_999';
      process.env.META_WHATSAPP_ACCESS_TOKEN = 'system_token_999';
      process.env.META_WHATSAPP_WABA_ID = 'system_waba_999';

      (prisma.notificationConfig.findUnique as jest.Mock).mockResolvedValue(null);

      const creds = await provider.getCredentials('clinic-sem-config');
      expect(creds.source).toBe('SYSTEM_DEFAULT');
      expect(creds.phoneNumberId).toBe('system_phone_999');
      expect(creds.accessToken).toBe('system_token_999');
    });
  });

  describe('send', () => {
    it('deve enviar mensagem com payload de template formatado corretamente', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ messages: [{ id: 'wamid.HBgLMTIz' }] }),
      });
      global.fetch = mockFetch as any;

      (prisma.notificationConfig.findUnique as jest.Mock).mockResolvedValue({
        clinicId: 'clinic-1',
        metaPhoneNumberId: 'phone_123',
        metaAccessTokenEncrypted: 'enc_token',
      });

      const result = await provider.send({
        clinicId: 'clinic-1',
        to: '(11) 98888-7777',
        templateName: 'vetos_alerta_vacina',
        templateLang: 'pt_BR',
        templateParameters: [{ type: 'text', text: 'Max' }],
      });

      expect(result.success).toBe(true);
      expect(result.metaMessageId).toBe('wamid.HBgLMTIz');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.facebook.com/v20.0/phone_123/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer decrypted_token_xyz',
          }),
        }),
      );

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.messaging_product).toBe('whatsapp');
      expect(requestBody.to).toBe('5511988887777');
      expect(requestBody.type).toBe('template');
      expect(requestBody.template.name).toBe('vetos_alerta_vacina');
      expect(requestBody.template.components[0].parameters[0].text).toBe('Max');
    });
  });
});
