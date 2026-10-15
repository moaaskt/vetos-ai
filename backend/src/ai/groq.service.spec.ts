import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GroqService } from './groq.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation((options) => {
    return {
      apiKey: options.apiKey,
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async (params, reqOpts) => {
            if (params.messages[0]?.content === 'TRIGGER_TIMEOUT') {
              return new Promise((_, reject) => {
                if (reqOpts?.signal) {
                  reqOpts.signal.addEventListener('abort', () => {
                    const err = new Error('The user aborted a request.');
                    err.name = 'AbortError';
                    reject(err);
                  });
                }
              });
            }
            if (params.messages[0]?.content === 'TRIGGER_ERROR') {
              throw new Error('Groq rate limit exceeded');
            }
            return {
              choices: [
                {
                  message: {
                    content: '{"diagnostico": "Gastroenterite Canina"}',
                  },
                },
              ],
            };
          }),
        },
      },
    };
  });
});

describe('GroqService', () => {
  let service: GroqService;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: jest.Mocked<PrismaService>;
  let encryptionService: jest.Mocked<EncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroqService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('gsk_global_mock_key'),
          },
        },
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
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GroqService>(GroqService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
    encryptionService = module.get(EncryptionService);
  });

  describe('resolveApiKey', () => {
    it('deve usar a chave própria da clínica quando configurada', async () => {
      (prismaService.notificationConfig.findUnique as jest.Mock).mockResolvedValue({
        groqApiKeyEncrypted: 'enc_custom_key',
      });
      (encryptionService.decrypt as jest.Mock).mockReturnValue('gsk_clinic_decrypted');

      const key = await service.resolveApiKey('clinic-123');
      expect(key).toBe('gsk_clinic_decrypted');
      expect(encryptionService.decrypt).toHaveBeenCalledWith('enc_custom_key');
    });

    it('deve recorrer à chave global GROQ_API_KEY quando a clínica não possuir chave própria', async () => {
      (prismaService.notificationConfig.findUnique as jest.Mock).mockResolvedValue(null);

      const key = await service.resolveApiKey('clinic-123');
      expect(key).toBe('gsk_global_mock_key');
      expect(configService.get).toHaveBeenCalledWith('GROQ_API_KEY');
    });

    it('deve recorrer à chave global se a descriptografia da chave da clínica falhar', async () => {
      (prismaService.notificationConfig.findUnique as jest.Mock).mockResolvedValue({
        groqApiKeyEncrypted: 'corrupted',
      });
      (encryptionService.decrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid key');
      });

      const key = await service.resolveApiKey('clinic-123');
      expect(key).toBe('gsk_global_mock_key');
    });
  });

  describe('chatCompletion', () => {
    it('deve retornar a resposta do LLM com sucesso', async () => {
      const response = await service.chatCompletion({
        messages: [{ role: 'user', content: 'Avaliar sintomas' }],
      });

      expect(response).toBe('{"diagnostico": "Gastroenterite Canina"}');
    });

    it('deve tratar timeout de 15s silenciosamente e retornar null sem lançar exceção', async () => {
      const response = await service.chatCompletion({
        messages: [{ role: 'user', content: 'TRIGGER_TIMEOUT' }],
        timeoutMs: 50, // Teste com timeout curto
      });

      expect(response).toBeNull();
    });

    it('deve tratar falhas de API silenciosamente e retornar null sem quebrar o fluxo', async () => {
      const response = await service.chatCompletion({
        messages: [{ role: 'user', content: 'TRIGGER_ERROR' }],
      });

      expect(response).toBeNull();
    });

    it('deve retornar null se nenhuma chave estiver disponível', async () => {
      configService.get.mockReturnValue(undefined as any);
      (prismaService.notificationConfig.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await service.chatCompletion({
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(response).toBeNull();
    });
  });
});
