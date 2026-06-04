import {
  Controller,
  Get,
  Patch,
  Put,
  Post,
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

    // Retorna a config sem a senha descriptografada, por segurança
    const { smtpPasswordEncrypted, ...rest } = config;
    return {
      ...rest,
      hasSmtpPassword: !!smtpPasswordEncrypted,
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

    if (dto.smtpPassword) {
      smtpPasswordEncrypted = this.encryptionService.encrypt(dto.smtpPassword);
    }

    const data: any = {
      emailEnabled: dto.emailEnabled,
      smtpHost: dto.smtpHost,
      smtpPort: dto.smtpPort ? Number(dto.smtpPort) : undefined,
      smtpUser: dto.smtpUser,
      smtpFromName: dto.smtpFromName,
      smtpFromEmail: dto.smtpFromEmail,
      whatsappEnabled: dto.whatsappEnabled,
    };

    if (smtpPasswordEncrypted !== undefined) {
      data.smtpPasswordEncrypted = smtpPasswordEncrypted;
    }

    const updated = await this.prisma.notificationConfig.upsert({
      where: { clinicId: user.clinicId },
      update: data,
      create: {
        clinicId: user.clinicId,
        ...data,
      },
    });

    const { smtpPasswordEncrypted: _, ...rest } = updated;
    return {
      ...rest,
      hasSmtpPassword: !!updated.smtpPasswordEncrypted,
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
      return await this.smtpProvider.sendTestEmail({
        clinicId: user.clinicId,
        to,
      });
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Falha ao enviar e-mail de teste',
      };
    }
  }

  @Get('templates')
  async getTemplates(@CurrentUser() user: any) {
    if (!user.clinicId) {
      throw new BadRequestException('Clinic ID is required');
    }

    const templates = await this.prisma.notificationTemplate.findMany({
      where: { clinicId: user.clinicId },
    });

    if (templates.length === 0) {
      const defaultTemplates = [
        {
          event: 'APPOINTMENT_CREATED',
          channel: 'EMAIL',
          subject: 'Consulta Agendada - {{petName}}',
          body: 'Olá {{clientName}},\n\nA consulta para o seu pet {{petName}} foi agendada com sucesso para {{appointmentDate}}.\n\nAtenciosamente,\nEquipe Veterinária',
          active: false,
        },
        {
          event: 'APPOINTMENT_CREATED',
          channel: 'WHATSAPP',
          body: 'Olá {{clientName}}, a consulta para {{petName}} foi agendada com sucesso para {{appointmentDate}}.',
          active: false,
        },
        {
          event: 'APPOINTMENT_REMINDER_24H',
          channel: 'EMAIL',
          subject: 'Lembrete de Consulta - {{petName}}',
          body: 'Olá {{clientName}},\n\nLembramos que {{petName}} tem uma consulta agendada para amanhã, {{appointmentDate}}.\n\nPor favor, confirme se poderá comparecer.\n\nAtenciosamente,\nEquipe Veterinária',
          active: false,
        },
        {
          event: 'APPOINTMENT_REMINDER_24H',
          channel: 'WHATSAPP',
          body: 'Olá {{clientName}}, lembramos que {{petName}} tem uma consulta agendada para amanhã, {{appointmentDate}}.',
          active: false,
        },
        {
          event: 'APPOINTMENT_REMINDER_2H',
          channel: 'EMAIL',
          subject: 'Lembrete: Consulta de {{petName}} em 2 horas',
          body: 'Olá {{clientName}},\n\nEste é um lembrete rápido de que a consulta de {{petName}} é hoje às {{appointmentDate}}.\n\nAtenciosamente,\nEquipe Veterinária',
          active: false,
        },
        {
          event: 'APPOINTMENT_REMINDER_2H',
          channel: 'WHATSAPP',
          body: 'Olá {{clientName}}, lembramos que a consulta de {{petName}} é hoje às {{appointmentDate}}.',
          active: false,
        },
        {
          event: 'APPOINTMENT_FOLLOW_UP',
          channel: 'EMAIL',
          subject: 'Como está o {{petName}}?',
          body: 'Olá {{clientName}},\n\nComo está se sentindo o {{petName}} após a consulta do dia {{appointmentDate}}?\n\nQualquer dúvida ou caso necessite de suporte adicional, por favor, entre em contato conosco.\n\nAtenciosamente,\nEquipe Veterinária',
          active: false,
        },
        {
          event: 'APPOINTMENT_FOLLOW_UP',
          channel: 'WHATSAPP',
          body: 'Olá {{clientName}}, como está {{petName}} após a consulta do dia {{appointmentDate}}? Se precisar de alguma coisa, estamos à disposição.',
          active: false,
        },
        {
          event: 'VACCINE_EXPIRATION',
          channel: 'EMAIL',
          subject: 'Alerta de Vacinação de {{petName}}',
          body: 'Olá {{clientName}},\n\nA vacina {{vaccineName}} de {{petName}} vence em breve ({{vaccineDate}}).\n\nRecomendamos agendar uma nova visita para que possamos aplicar a dose de reforço e manter a proteção em dia.\n\nAtenciosamente,\nEquipe Veterinária',
          active: false,
        },
        {
          event: 'VACCINE_EXPIRATION',
          channel: 'WHATSAPP',
          body: 'Olá {{clientName}}, a vacina {{vaccineName}} de {{petName}} vence em breve ({{vaccineDate}}). Agende um horário para a dose de reforço.',
          active: false,
        },
        {
          event: 'RETENTION',
          channel: 'EMAIL',
          subject: 'Saudades de {{petName}}!',
          body: 'Olá {{clientName}},\n\nFaz algum tempo que não vemos {{petName}} por aqui.\n\nQue tal agendarmos uma consulta de rotina para realizar um check-up geral?\n\nAtenciosamente,\nEquipe Veterinária',
          active: false,
        },
        {
          event: 'RETENTION',
          channel: 'WHATSAPP',
          body: 'Olá {{clientName}}, faz algum tempo que não vemos {{petName}} por aqui. Agende um check-up de rotina para mantermos a saúde dele em dia!',
          active: false,
        },
      ];

      await this.prisma.notificationTemplate.createMany({
        data: defaultTemplates.map((t) => ({
          ...t,
          clinicId: user.clinicId,
          channel: t.channel as any,
        })),
      });

      return this.prisma.notificationTemplate.findMany({
        where: { clinicId: user.clinicId },
      });
    }

    return templates;
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
}
