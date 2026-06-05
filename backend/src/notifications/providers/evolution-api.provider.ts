import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../encryption/encryption.service';

export interface WhatsAppSendInput {
  clinicId: string;
  to: string;
  body: string;
}

@Injectable()
export class EvolutionApiProvider {
  private readonly logger = new Logger(EvolutionApiProvider.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async send(input: WhatsAppSendInput) {
    const config = await this.getWhatsAppConfig(input.clinicId);
    const formattedNumber = this.formatPhoneNumber(input.to);

    const baseUrl = config.instanceUrl.replace(/\/$/, '');
    const url = `${baseUrl}/message/sendText/${config.instanceName}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.apiKey,
        },
        body: JSON.stringify({
          number: formattedNumber,
          text: input.body,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Evolution API send message failed: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `Evolution API failed to send message: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        providerMessageId: data.key?.id || `wa_${Date.now()}`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to post message to Evolution API`, error);
      throw error;
    }
  }

  async testConnection(clinicId: string) {
    const config = await this.getWhatsAppConfig(clinicId);
    const baseUrl = config.instanceUrl.replace(/\/$/, '');
    const url = `${baseUrl}/instance/connectionState/${config.instanceName}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': config.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Evolution API testConnection failed: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `Evolution API connection failed: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const state = data.instance?.state || data.state;

      if (state !== 'open') {
        throw new Error(
          `WhatsApp instance is disconnected (State: ${state || 'unknown'})`,
        );
      }

      return {
        success: true,
      };
    } catch (error: any) {
      this.logger.error(`Failed to test connection to Evolution API`, error);
      throw error;
    }
  }

  private async getWhatsAppConfig(clinicId: string) {
    const config = await this.prisma.notificationConfig.findUnique({
      where: { clinicId },
    });

    if (!config || !config.whatsappEnabled) {
      throw new Error('WhatsApp configuration is not enabled for this clinic');
    }

    if (
      !config.whatsappInstanceUrl ||
      !config.whatsappInstanceName ||
      !config.whatsappApiKeyEncrypted
    ) {
      throw new Error('WhatsApp configuration is incomplete for this clinic');
    }

    return {
      instanceUrl: config.whatsappInstanceUrl,
      instanceName: config.whatsappInstanceName,
      apiKey: this.encryptionService.decrypt(config.whatsappApiKeyEncrypted),
    };
  }

  async createInstance(clinicId: string) {
    const config = await this.getWhatsAppConfigRaw(clinicId);
    const baseUrl = config.instanceUrl.replace(/\/$/, '');
    const url = `${baseUrl}/instance/create`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.apiKey,
        },
        body: JSON.stringify({
          instanceName: config.instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Evolution API createInstance failed: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `Evolution API failed to create instance: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      this.logger.error(`Failed to create instance in Evolution API`, error);
      throw error;
    }
  }

  async getQrCode(clinicId: string) {
    const config = await this.getWhatsAppConfigRaw(clinicId);
    const baseUrl = config.instanceUrl.replace(/\/$/, '');
    const url = `${baseUrl}/instance/connect/${config.instanceName}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': config.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Evolution API getQrCode failed: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `Evolution API failed to get QR code: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        base64: data.base64 || data.code,
        pairingCode: data.pairingCode,
        code: data.code,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get QR code from Evolution API`, error);
      throw error;
    }
  }

  async getConnectionStatus(clinicId: string) {
    const config = await this.getWhatsAppConfigRaw(clinicId);
    const baseUrl = config.instanceUrl.replace(/\/$/, '');
    const url = `${baseUrl}/instance/connectionState/${config.instanceName}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': config.apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Evolution API getConnectionStatus failed: ${response.status} - ${errorText}`,
        );
        throw new Error(
          `Evolution API failed to get connection status: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return {
        success: true,
        state: data.instance?.state || data.state || 'unknown',
      };
    } catch (error: any) {
      this.logger.error(`Failed to get connection status from Evolution API`, error);
      throw error;
    }
  }

  async deleteInstance(clinicId: string) {
    let config;
    try {
      config = await this.getWhatsAppConfigRaw(clinicId);
    } catch (e) {
      // Ignora erro se não tiver config no banco
    }

    if (config) {
      const baseUrl = config.instanceUrl.replace(/\/$/, '');
      const url = `${baseUrl}/instance/delete/${config.instanceName}`;

      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'apikey': config.apiKey,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.warn(
            `Evolution API deleteInstance failed: ${response.status} - ${errorText}`,
          );
        }
      } catch (error: any) {
        this.logger.warn(`Failed to delete instance in Evolution API`, error);
      }
    }

    // Limpa as credenciais locais no banco de dados
    await this.prisma.notificationConfig.update({
      where: { clinicId },
      data: {
        whatsappEnabled: false,
        whatsappInstanceUrl: null,
        whatsappInstanceName: null,
        whatsappApiKeyEncrypted: null,
      },
    });

    return {
      success: true,
    };
  }

  private async getWhatsAppConfigRaw(clinicId: string) {
    const config = await this.prisma.notificationConfig.findUnique({
      where: { clinicId },
    });

    if (
      !config ||
      !config.whatsappInstanceUrl ||
      !config.whatsappInstanceName ||
      !config.whatsappApiKeyEncrypted
    ) {
      throw new Error('WhatsApp configuration is incomplete for this clinic');
    }

    return {
      instanceUrl: config.whatsappInstanceUrl,
      instanceName: config.whatsappInstanceName,
      apiKey: this.encryptionService.decrypt(config.whatsappApiKeyEncrypted),
    };
  }

  private formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/\D/g, '');

    // Se o número for do Brasil e tiver DD + Número sem DDI, adiciona 55
    if (clean.length === 10 || clean.length === 11) {
      clean = `55${clean}`;
    }

    return clean;
  }
}
