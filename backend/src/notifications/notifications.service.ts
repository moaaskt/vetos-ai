import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationChannel = 'EMAIL' | 'WHATSAPP';
export type NotificationEvent =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_REMINDER_24H'
  | 'APPOINTMENT_REMINDER_2H'
  | 'APPOINTMENT_FOLLOW_UP'
  | 'VACCINE_EXPIRATION'
  | 'RETENTION'
  | 'LEGACY_NOTIFICATION'
  | string;

export interface EnqueueNotificationInput {
  clinicId?: string;
  channel: NotificationChannel;
  to: string;
  body: string;
  subject?: string;
  event: NotificationEvent;
  scheduledFor?: Date;
  appointmentDate?: Date | string;
  appointmentId?: string;
  clientId?: string;
  petId?: string;
  vaccineRecordId?: string;
  delayMs?: number;
  jobId?: string;
  clientName?: string;
  petName?: string;
  clinicName?: string;
  vaccineName?: string;
  nextDoseDate?: Date | string;
}


@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async ensureDefaultTemplates(clinicId: string): Promise<void> {
    const defaultTemplates = [
      {
        event: 'APPOINTMENT_CREATED',
        channel: 'EMAIL' as const,
        subject: 'Consulta Agendada - {{petName}}',
        body: 'Olá {{clientName}},\n\nA consulta para o seu pet {{petName}} foi agendada com sucesso para {{appointmentDate}}.\n\nAtenciosamente,\nEquipe Veterinária',
        active: false,
      },
      {
        event: 'APPOINTMENT_CREATED',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, a consulta para {{petName}} foi agendada com sucesso para {{appointmentDate}}.',
        active: false,
      },
      {
        event: 'APPOINTMENT_REMINDER_24H',
        channel: 'EMAIL' as const,
        subject: 'Lembrete de Consulta - {{petName}}',
        body: 'Olá {{clientName}},\n\nLembramos que {{petName}} tem uma consulta agendada para amanhã, {{appointmentDate}}.\n\nPor favor, confirme se poderá comparecer.\n\nAtenciosamente,\nEquipe Veterinária',
        active: false,
      },
      {
        event: 'APPOINTMENT_REMINDER_24H',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, lembramos que {{petName}} tem uma consulta agendada para amanhã, {{appointmentDate}}.',
        active: false,
      },
      {
        event: 'APPOINTMENT_REMINDER_2H',
        channel: 'EMAIL' as const,
        subject: 'Lembrete: Consulta de {{petName}} em 2 horas',
        body: 'Olá {{clientName}},\n\nEste é um lembrete rápido de que a consulta de {{petName}} é hoje às {{appointmentDate}}.\n\nAtenciosamente,\nEquipe Veterinária',
        active: false,
      },
      {
        event: 'APPOINTMENT_REMINDER_2H',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, lembramos que a consulta de {{petName}} é hoje às {{appointmentDate}}.',
        active: false,
      },
      {
        event: 'APPOINTMENT_FOLLOW_UP',
        channel: 'EMAIL' as const,
        subject: 'Como está o {{petName}}?',
        body: 'Olá {{clientName}},\n\nComo está se sentindo o {{petName}} após a consulta do dia {{appointmentDate}}?\n\nQualquer dúvida ou caso necessite de suporte adicional, por favor, entre em contato conosco.\n\nAtenciosamente,\nEquipe Veterinária',
        active: false,
      },
      {
        event: 'APPOINTMENT_FOLLOW_UP',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, como está {{petName}} após a consulta do dia {{appointmentDate}}? Se precisar de alguma coisa, estamos à disposição.',
        active: false,
      },
      {
        event: 'VACCINE_EXPIRATION',
        channel: 'EMAIL' as const,
        subject: 'Alerta de Vacinação de {{petName}}',
        body: 'Olá {{clientName}},\n\nA vacina {{vaccineName}} de {{petName}} vence em breve ({{vaccineDate}}).\n\nRecomendamos agendar uma nova visita para que possamos aplicar a dose de reforço e manter a proteção em dia.\n\nAtenciosamente,\nEquipe Veterinária',
        active: false,
      },
      {
        event: 'VACCINE_EXPIRATION',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, a vacina {{vaccineName}} de {{petName}} vence em breve ({{vaccineDate}}). Agende um horário para a dose de reforço.',
        active: false,
      },
      {
        event: 'VACCINE_REMINDER_7D',
        channel: 'EMAIL' as const,
        subject: 'Lembrete: Vacinação de {{petName}} em 7 dias',
        body: 'Olá {{clientName}},\n\nLembramos que a vacina {{vaccineName}} de {{petName}} vencerá em 7 dias ({{nextDoseDate}}).\n\nRecomendamos agendar uma visita para manter a proteção de seu pet em dia.\n\nAtenciosamente,\n{{clinicName}}',
        active: false,
      },
      {
        event: 'VACCINE_REMINDER_7D',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, lembramos que a vacina {{vaccineName}} de {{petName}} vencerá em 7 dias ({{nextDoseDate}}). Agende uma visita para a dose de reforço.',
        active: false,
      },
      {
        event: 'VACCINE_REMINDER_1D',
        channel: 'EMAIL' as const,
        subject: 'Lembrete: Vacinação de {{petName}} é amanhã',
        body: 'Olá {{clientName}},\n\nLembramos que a vacina {{vaccineName}} de {{petName}} vencerá amanhã ({{nextDoseDate}}).\n\nRecomendamos agendar uma visita para manter a proteção de seu pet em dia.\n\nAtenciosamente,\n{{clinicName}}',
        active: false,
      },
      {
        event: 'VACCINE_REMINDER_1D',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, lembramos que a vacina {{vaccineName}} de {{petName}} vencerá amanhã ({{nextDoseDate}}). Agende uma visita para a dose de reforço.',
        active: false,
      },
      {
        event: 'VACCINE_REMINDER_DAY',
        channel: 'EMAIL' as const,
        subject: 'Lembrete: Vacinação de {{petName}} hoje',
        body: 'Olá {{clientName}},\n\nLembramos que a vacina {{vaccineName}} de {{petName}} vence hoje ({{nextDoseDate}}).\n\nRecomendamos agendar uma visita para manter a proteção de seu pet em dia.\n\nAtenciosamente,\n{{clinicName}}',
        active: false,
      },
      {
        event: 'VACCINE_REMINDER_DAY',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, lembramos que a vacina {{vaccineName}} de {{petName}} vence hoje ({{nextDoseDate}}). Agende uma visita para a dose de reforço.',
        active: false,
      },
      {
        event: 'RETENTION',
        channel: 'EMAIL' as const,
        subject: 'Saudades de {{petName}}!',
        body: 'Olá {{clientName}},\n\nFaz algum tempo que não vemos {{petName}} por aqui.\n\nQue tal agendarmos uma consulta de rotina para realizar um check-up geral?\n\nAtenciosamente,\nEquipe Veterinária',
        active: false,
      },
      {
        event: 'RETENTION',
        channel: 'WHATSAPP' as const,
        body: 'Olá {{clientName}}, faz algum tempo que não vemos {{petName}} por aqui. Agende um check-up de rotina para mantermos a saúde dele em dia!',
        active: false,
      },
    ];

    for (const template of defaultTemplates) {
      await this.prisma.notificationTemplate.upsert({
        where: {
          clinicId_event_channel: {
            clinicId,
            event: template.event,
            channel: template.channel,
          },
        },
        update: {}, // Mantém os dados customizados intactos
        create: {
          clinicId,
          ...template,
        },
      });
    }
  }

  async getActiveChannelsForEvent(
    clinicId: string,
    event: NotificationEvent,
  ): Promise<NotificationChannel[]> {
    // Assegura de forma idempotente que os templates padrões existam para a clínica
    await this.ensureDefaultTemplates(clinicId);

    const templates = await this.prisma.notificationTemplate.findMany({
      where: {
        clinicId,
        event,
        active: true,
      },
      select: {
        channel: true,
      },
    });

    const channels = [...new Set(templates.map((template) => template.channel))];

    return channels;
  }

  async enqueueNotification(to: string, message: string): Promise<void>;
  async enqueueNotification(input: EnqueueNotificationInput): Promise<void>;
  async enqueueNotification(
    inputOrTo: EnqueueNotificationInput | string,
    message?: string,
  ): Promise<void> {
    const payload =
      typeof inputOrTo === 'string'
        ? {
            channel: 'WHATSAPP' as const,
            to: inputOrTo,
            body: message ?? '',
            event: 'LEGACY_NOTIFICATION',
          }
        : inputOrTo;

    await this.notificationsQueue.add('send-message', payload, {
      delay: payload.delayMs,
      jobId: payload.jobId,
    });
  }

  async cancelNotificationJob(jobId: string): Promise<void> {
    const job = await this.notificationsQueue.getJob(jobId);
    await job?.remove();
  }
}
