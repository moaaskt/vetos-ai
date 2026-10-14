import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';

export interface MetaWhatsAppSendInput {
  clinicId: string;
  to: string;
  body?: string;
  templateName?: string;
  templateLang?: string;
  templateParameters?: { type: string; text?: string; [key: string]: any }[];
}

export interface MetaResolvedCredentials {
  phoneNumberId: string;
  wabaId?: string;
  accessToken: string;
  source: 'CLINIC' | 'SYSTEM_DEFAULT';
}

@Injectable()
export class MetaCloudApiProvider {
  private readonly logger = new Logger(MetaCloudApiProvider.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Normaliza números de telefone para o padrão internacional E.164 SEM o sinal "+".
   * Remove espaços, hífens, parênteses e pontos.
   * Exemplo: "+55 (11) 98888-7777" -> "5511988887777"
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    const hasPlus = phone.trim().startsWith('+');
    const cleanDigits = phone.replace(/\D/g, '');

    // Se o número foi explicitamente fornecido com código internacional (iniciado por +)
    if (hasPlus) {
      return cleanDigits;
    }
    
    // Se for número brasileiro com 10 ou 11 dígitos sem código de país, adiciona 55
    if (cleanDigits.length === 10 || cleanDigits.length === 11) {
      return `55${cleanDigits}`;
    }

    return cleanDigits;
  }

  /**
   * Resolve as credenciais da Meta com fallback:
   * 1. Credencial própria da clínica (descriptografada via AES-256-GCM)
   * 2. Variáveis de ambiente centrais do VetOS AI
   */
  async getCredentials(clinicId?: string): Promise<MetaResolvedCredentials> {
    if (clinicId) {
      const config = await this.prisma.notificationConfig.findUnique({
        where: { clinicId },
      });

      if (config && config.metaPhoneNumberId && config.metaAccessTokenEncrypted) {
        try {
          const accessToken = this.encryptionService.decrypt(config.metaAccessTokenEncrypted);
          return {
            phoneNumberId: config.metaPhoneNumberId,
            wabaId: config.metaWabaId || undefined,
            accessToken,
            source: 'CLINIC',
          };
        } catch (err) {
          this.logger.warn(
            `Falha ao descriptografar token Meta da clínica ${clinicId}. Recorrendo às credenciais padrão do sistema.`,
            err,
          );
        }
      }
    }

    const defaultPhoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    const defaultToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
    const defaultWabaId = process.env.META_WHATSAPP_WABA_ID;

    if (!defaultPhoneId || !defaultToken) {
      throw new Error(
        'Nenhuma credencial da Meta WhatsApp Cloud API configurada para a clínica nem variáveis centrais no sistema.',
      );
    }

    return {
      phoneNumberId: defaultPhoneId,
      wabaId: defaultWabaId,
      accessToken: defaultToken,
      source: 'SYSTEM_DEFAULT',
    };
  }

  /**
   * Envia mensagem via Meta WhatsApp Cloud API Oficial (Graph API v20.0).
   * Suporta envio por template aprovado (HSM/UTILITY) ou texto simples (janela de atendimento).
   */
  async send(input: MetaWhatsAppSendInput) {
    const credentials = await this.getCredentials(input.clinicId);
    const recipient = this.normalizePhoneNumber(input.to);

    if (!recipient) {
      throw new Error(`Número de telefone destinatário inválido ou vazio: "${input.to}"`);
    }

    const url = `https://graph.facebook.com/v20.0/${credentials.phoneNumberId}/messages`;

    // Monta o payload no formato oficial exigido pela Meta
    let payload: Record<string, any>;

    if (input.templateName) {
      // Mensagem ativa utilizando template oficial aprovado (HSM)
      const components: any[] = [];
      if (input.templateParameters && input.templateParameters.length > 0) {
        components.push({
          type: 'body',
          parameters: input.templateParameters,
        });
      }

      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'template',
        template: {
          name: input.templateName,
          language: {
            code: input.templateLang || 'pt_BR',
          },
          ...(components.length > 0 ? { components } : {}),
        },
      };
    } else {
      // Mensagem de texto simples (para respostas dentro da janela de 24h ou testes)
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: {
          preview_url: false,
          body: input.body || '',
        },
      };
    }

    this.logger.log(
      `Disparando WhatsApp via Meta Cloud API (${credentials.source}) para ${recipient} usando ${
        input.templateName ? `template "${input.templateName}"` : 'texto simples'
      }`,
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg =
          errorData?.error?.message ||
          `Erro HTTP ${response.status}: ${response.statusText}`;
        this.logger.error(`Meta WhatsApp Cloud API erro: ${JSON.stringify(errorData || errorMsg)}`);
        throw new Error(`Falha no envio Meta WhatsApp Cloud API: ${errorMsg}`);
      }

      const result = await response.json();
      const metaMessageId = result.messages?.[0]?.id || `wamid_${Date.now()}`;

      this.logger.log(`WhatsApp enviado com sucesso pela Meta. ID: ${metaMessageId}`);

      return {
        success: true,
        metaMessageId,
        providerMessageId: metaMessageId,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao disparar mensagem pela Meta WhatsApp Cloud API`, error);
      throw error;
    }
  }

  /**
   * Testa a validade das credenciais da Meta realizando uma chamada leve ao endpoint oficial de WABA/Phone
   */
  async testConnection(phoneNumberId: string, accessToken: string) {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || `Falha de autenticação na Meta (HTTP ${response.status})`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        displayPhoneNumber: data.display_phone_number,
        verifiedName: data.verified_name,
        qualityRating: data.quality_rating,
      };
    } catch (err: any) {
      throw new Error(`Conexão com a Meta Cloud API falhou: ${err.message}`);
    }
  }
}
