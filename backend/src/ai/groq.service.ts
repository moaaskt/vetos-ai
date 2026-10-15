import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';

export interface GroqChatCompletionParams {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: 'llama-3.1-70b-versatile' | 'mixtral-8x7b-32768' | string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' };
  timeoutMs?: number;
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly DEFAULT_TIMEOUT_MS = 15000;
  private readonly DEFAULT_MODEL = 'llama-3.1-70b-versatile';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Resolve a API Key com suporte multi-tenant:
   * 1. Chave própria da clínica configurada em NotificationConfig (descriptografada)
   * 2. Fallback para GROQ_API_KEY central do sistema no .env
   */
  async resolveApiKey(clinicId?: string): Promise<string | null> {
    if (clinicId) {
      try {
        const config = await this.prisma.notificationConfig.findUnique({
          where: { clinicId },
          select: { groqApiKeyEncrypted: true },
        });

        if (config?.groqApiKeyEncrypted) {
          return this.encryptionService.decrypt(config.groqApiKeyEncrypted);
        }
      } catch (err: any) {
        this.logger.warn(
          `Falha ao recuperar chave Groq customizada da clínica ${clinicId}. Recorrendo à chave global do sistema: ${err.message}`,
        );
      }
    }

    const globalKey = this.configService.get<string>('GROQ_API_KEY');
    return globalKey || null;
  }

  /**
   * Instancia o cliente da Groq com a credencial resolvida.
   */
  async getClient(clinicId?: string): Promise<Groq | null> {
    const apiKey = await this.resolveApiKey(clinicId);
    if (!apiKey) {
      this.logger.warn(
        'Nenhuma chave de API da Groq encontrada (nem na clínica nem nas variáveis centrais GROQ_API_KEY).',
      );
      return null;
    }

    return new Groq({ apiKey });
  }

  /**
   * Executa chamada de inferência à Groq com timeout de 15s e fallback gracioso.
   * NUNCA lança exceção fatal que quebre o fluxo da aplicação.
   */
  async chatCompletion(
    params: GroqChatCompletionParams,
    clinicId?: string,
  ): Promise<string | null> {
    const timeout = params.timeoutMs ?? this.DEFAULT_TIMEOUT_MS;
    const model = params.model ?? this.DEFAULT_MODEL;

    try {
      const client = await this.getClient(clinicId);
      if (!client) {
        return null;
      }

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeout);

      try {
        const response = await client.chat.completions.create(
          {
            model,
            messages: params.messages,
            temperature: params.temperature ?? 0.3,
            max_tokens: params.maxTokens ?? 1500,
            response_format: params.responseFormat,
          },
          {
            signal: abortController.signal,
          },
        );

        clearTimeout(timeoutId);

        const choice = response.choices?.[0]?.message?.content;
        return choice ?? null;
      } catch (apiError: any) {
        clearTimeout(timeoutId);

        if (abortController.signal.aborted) {
          this.logger.error(
            `Timeout de ${timeout}ms excedido na chamada à API Groq (modelo: ${model}). Falha tratada silenciosamente.`,
          );
        } else {
          this.logger.error(
            `Erro durante inferência no Groq (${model}): ${apiError.message}`,
          );
        }

        return null;
      }
    } catch (unexpectedError: any) {
      this.logger.error(
        `Erro inesperado no GroqService: ${unexpectedError.message}`,
      );
      return null;
    }
  }
}
