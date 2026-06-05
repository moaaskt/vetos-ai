import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SmtpProvider } from './providers/smtp.provider';
import { EvolutionApiProvider } from './providers/evolution-api.provider';
import { NotificationsService } from './notifications.service';
import { EncryptionService } from '../encryption/encryption.service';
import { UpdateNotificationConfigDto } from './dto/update-config.dto';
import { UpdateNotificationTemplateDto } from './dto/update-template.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smtpProvider: SmtpProvider,
    private readonly notificationsService: NotificationsService,
    private readonly encryptionService: EncryptionService,
    private readonly evolutionApiProvider: EvolutionApiProvider,
  ) {}

  @Get('config')
  async getConfig(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    let config = await this.prisma.notificationConfig.findUnique({
      where: { clinicId: user.clinicId },
    });

    if (!config) {
      config = await this.prisma.notificationConfig.create({
        data: {
          clinicId: user.clinicId,
          emailEnabled: false,
          whatsappEnabled: false,
        },
      });
    }

    // Retorna a config sem a senha e sem a apiKey do whatsapp, por segurança
    const { smtpPasswordEncrypted, whatsappApiKeyEncrypted, ...rest } = config;
    return {
      ...rest,
      hasSmtpPassword: !!smtpPasswordEncrypted,
      hasWhatsappApiKey: !!whatsappApiKeyEncrypted,
    };
  }

  @Patch('config')
  async updateConfig(
    @CurrentUser() user: any,
    @Body() dto: UpdateNotificationConfigDto,
  ) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    const currentConfig = await this.prisma.notificationConfig.findUnique({
      where: { clinicId: user.clinicId },
    });

    let smtpPasswordEncrypted = currentConfig?.smtpPasswordEncrypted;
    let whatsappApiKeyEncrypted = currentConfig?.whatsappApiKeyEncrypted;

    if (dto.smtpPassword) {
      smtpPasswordEncrypted = this.encryptionService.encrypt(dto.smtpPassword);
    }
    if (dto.whatsappApiKey) {
      whatsappApiKeyEncrypted = this.encryptionService.encrypt(dto.whatsappApiKey);
    }

    const data: any = {
      emailEnabled: dto.emailEnabled,
      smtpHost: dto.smtpHost,
      smtpPort: dto.smtpPort ? Number(dto.smtpPort) : undefined,
      smtpUser: dto.smtpUser,
      smtpFromName: dto.smtpFromName,
      smtpFromEmail: dto.smtpFromEmail,
      whatsappEnabled: dto.whatsappEnabled,
      whatsappInstanceUrl: dto.whatsappInstanceUrl,
      whatsappInstanceName: dto.whatsappInstanceName,
    };

    if (smtpPasswordEncrypted !== undefined) {
      data.smtpPasswordEncrypted = smtpPasswordEncrypted;
    }
    if (whatsappApiKeyEncrypted !== undefined) {
      data.whatsappApiKeyEncrypted = whatsappApiKeyEncrypted;
    }

    const updated = await this.prisma.notificationConfig.upsert({
      where: { clinicId: user.clinicId },
      update: data,
      create: {
        clinicId: user.clinicId,
        ...data,
      },
    });

    const { smtpPasswordEncrypted: _, whatsappApiKeyEncrypted: __, ...rest } = updated;
    return {
      ...rest,
      hasSmtpPassword: !!updated.smtpPasswordEncrypted,
      hasWhatsappApiKey: !!updated.whatsappApiKeyEncrypted,
    };
  }

  @Post('config/test-smtp')
  async testSmtpConnection(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    try {
      return await this.smtpProvider.testConnection(user.clinicId);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Falha ao testar conexão SMTP',
      };
    }
  }

  @Post('config/send-test-email')
  async sendTestEmail(
    @CurrentUser() user: any,
    @Body('to') to: string,
  ) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    if (!to) {
      throw new BadRequestException('Destinatário do e-mail é obrigatório');
    }

    try {
      const result = await this.smtpProvider.sendTestEmail({
        clinicId: user.clinicId,
        to,
      });
      await this.createTestNotificationLog({
        clinicId: user.clinicId,
        channel: 'EMAIL',
        to,
        subject: 'VetOS AI - teste SMTP',
        body: 'Este e um email de teste da configuracao SMTP do VetOS AI.',
        event: 'TEST_EMAIL',
        status: 'SENT',
        providerMessageId: result.providerMessageId,
      });
      return result;
    } catch (error: any) {
      await this.createTestNotificationLog({
        clinicId: user.clinicId,
        channel: 'EMAIL',
        to,
        subject: 'VetOS AI - teste SMTP',
        body: 'Este e um email de teste da configuracao SMTP do VetOS AI.',
        event: 'TEST_EMAIL',
        status: 'FAILED',
        errorMessage: error.message || 'Falha ao enviar e-mail de teste',
      });
      return {
        success: false,
        message: error.message || 'Falha ao enviar e-mail de teste',
      };
    }
  }

  @Post('config/test-whatsapp')
  async testWhatsappConnection(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    try {
      return await this.evolutionApiProvider.testConnection(user.clinicId);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Falha ao testar conexão do WhatsApp',
      };
    }
  }

  @Post('config/send-test-whatsapp')
  async sendTestWhatsapp(
    @CurrentUser() user: any,
    @Body('to') to: string,
  ) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    if (!to) {
      throw new BadRequestException('Destinatário do WhatsApp é obrigatório');
    }

    try {
      const body =
        'Este e um WhatsApp de teste da integracao do VetOS AI via Evolution API.';
      const result = await this.evolutionApiProvider.send({
        clinicId: user.clinicId,
        to,
        body,
      });
      await this.createTestNotificationLog({
        clinicId: user.clinicId,
        channel: 'WHATSAPP',
        to,
        body,
        event: 'TEST_WHATSAPP',
        status: 'SENT',
        providerMessageId: result.providerMessageId,
      });
      return result;
    } catch (error: any) {
      await this.createTestNotificationLog({
        clinicId: user.clinicId,
        channel: 'WHATSAPP',
        to,
        body:
          'Este e um WhatsApp de teste da integracao do VetOS AI via Evolution API.',
        event: 'TEST_WHATSAPP',
        status: 'FAILED',
        errorMessage: error.message || 'Falha ao enviar WhatsApp de teste',
      });
      return {
        success: false,
        message: error.message || 'Falha ao enviar WhatsApp de teste',
      };
    }
  }

  @Post('config/whatsapp/create-instance')
  async createWhatsappInstance(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    try {
      return await this.evolutionApiProvider.createInstance(user.clinicId);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Falha ao criar instância do WhatsApp',
      };
    }
  }

  @Get('config/whatsapp/qr')
  async getWhatsappQr(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    try {
      return await this.evolutionApiProvider.getQrCode(user.clinicId);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Falha ao obter QR code do WhatsApp',
      };
    }
  }

  @Get('config/whatsapp/status')
  async getWhatsappStatus(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    try {
      return await this.evolutionApiProvider.getConnectionStatus(user.clinicId);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Falha ao obter status de conexão do WhatsApp',
      };
    }
  }

  @Delete('config/whatsapp')
  async deleteWhatsappConfig(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    try {
      return await this.evolutionApiProvider.deleteInstance(user.clinicId);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Falha ao excluir configuração do WhatsApp',
      };
    }
  }

  @Get('templates')
  async getTemplates(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    // Garante que todos os templates padrão existam de forma idempotente
    await this.notificationsService.ensureDefaultTemplates(user.clinicId);

    return this.prisma.notificationTemplate.findMany({
      where: { clinicId: user.clinicId },
    });
  }

  @Put('templates')
  async updateTemplate(
    @CurrentUser() user: any,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    return this.prisma.notificationTemplate.upsert({
      where: {
        clinicId_event_channel: {
          clinicId: user.clinicId,
          event: dto.event,
          channel: dto.channel,
        },
      },
      update: {
        subject: dto.subject,
        body: dto.body,
        active: dto.active,
      },
      create: {
        clinicId: user.clinicId,
        event: dto.event,
        channel: dto.channel,
        subject: dto.subject,
        body: dto.body,
        active: dto.active,
      },
    });
  }

  @Get('logs')
  async getLogs(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('event') event?: string,
    @Query('to') to?: string,
  ) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    const where: any = {
      clinicId: user.clinicId,
    };

    if (status) {
      where.status = status;
    }
    if (channel) {
      where.channel = channel;
    }
    if (event) {
      where.event = event;
    }
    if (to) {
      where.to = {
        contains: to,
        mode: 'insensitive',
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [items, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          appointment: {
            select: {
              date: true,
              reason: true,
              pet: { select: { name: true } },
              client: { select: { name: true } },
            },
          },
          client: { select: { name: true } },
          pet: { select: { name: true } },
        },
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  @Post('logs/:id/retry')
  async retryNotification(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    const log = await this.prisma.notificationLog.findFirst({
      where: {
        id,
        clinicId: user.clinicId,
      },
    });

    if (!log) {
      throw new NotFoundException('Log de notificação não encontrado');
    }

    // Coloca a notificação novamente na fila do BullMQ
    await this.notificationsService.enqueueNotification({
      clinicId: log.clinicId,
      channel: log.channel,
      to: log.to,
      body: log.body,
      subject: log.subject ?? undefined,
      event: log.event,
      appointmentId: log.appointmentId ?? undefined,
      clientId: log.clientId ?? undefined,
      petId: log.petId ?? undefined,
    });

    return {
      success: true,
      message: 'Reenvio de notificação enfileirado com sucesso',
    };
  }

  private async createTestNotificationLog(input: {
    clinicId: string;
    channel: 'EMAIL' | 'WHATSAPP';
    to: string;
    subject?: string;
    body: string;
    event: 'TEST_EMAIL' | 'TEST_WHATSAPP';
    status: 'SENT' | 'FAILED';
    providerMessageId?: string;
    errorMessage?: string;
  }): Promise<void> {
    await this.prisma.notificationLog.create({
      data: {
        clinicId: input.clinicId,
        channel: input.channel,
        to: input.to,
        subject: input.subject,
        body: input.body,
        event: input.event,
        status: input.status,
        providerMessageId: input.providerMessageId,
        errorMessage: input.errorMessage,
        sentAt: input.status === 'SENT' ? new Date() : undefined,
      },
    });
  }
}
