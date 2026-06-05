import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EncryptionService } from '../../encryption/encryption.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface SmtpSendInput {
  clinicId: string;
  to: string;
  subject?: string;
  body: string;
}

export interface SmtpTestEmailInput {
  clinicId: string;
  to: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromName?: string;
  fromEmail: string;
}

@Injectable()
export class SmtpProvider {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async send(input: SmtpSendInput) {
    const smtpConfig = await this.getSmtpConfig(input.clinicId);
    const transporter = this.createTransporter(smtpConfig);
    const info = await this.executeSmtpOperation(() =>
      transporter.sendMail({
        from: this.formatFromAddress(smtpConfig),
        to: input.to,
        subject: input.subject ?? 'VetOS AI',
        text: input.body,
        html: input.body,
      }),
    );

    return {
      success: true,
      providerMessageId: info.messageId,
    };
  }

  async testConnection(clinicId: string) {
    const smtpConfig = await this.getSmtpConfig(clinicId);
    const transporter = this.createTransporter(smtpConfig);

    await this.executeSmtpOperation(() => transporter.verify());

    return {
      success: true,
    };
  }

  async sendTestEmail(input: SmtpTestEmailInput) {
    return this.send({
      clinicId: input.clinicId,
      to: input.to,
      subject: 'VetOS AI - teste SMTP',
      body: 'Este e um email de teste da configuracao SMTP do VetOS AI.',
    });
  }

  private async getSmtpConfig(clinicId: string): Promise<SmtpConfig> {
    const config = await this.prisma.notificationConfig.findUnique({
      where: { clinicId },
    });

    if (!config || !config.emailEnabled) {
      throw new Error('SMTP configuration is not enabled for this clinic');
    }

    if (
      !config.smtpHost ||
      !config.smtpPort ||
      !config.smtpUser ||
      !config.smtpPasswordEncrypted ||
      !config.smtpFromEmail
    ) {
      throw new Error('SMTP configuration is incomplete for this clinic');
    }

    return {
      host: config.smtpHost,
      port: config.smtpPort,
      user: config.smtpUser,
      password: this.encryptionService.decrypt(config.smtpPasswordEncrypted),
      fromName: config.smtpFromName ?? undefined,
      fromEmail: config.smtpFromEmail,
    };
  }

  private createTransporter(
    config: SmtpConfig,
  ): Transporter<SMTPTransport.SentMessageInfo> {
    return createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  private formatFromAddress(config: SmtpConfig): string {
    if (!config.fromName) {
      return config.fromEmail;
    }

    return `"${config.fromName.replace(/"/g, '\\"')}" <${config.fromEmail}>`;
  }

  private async executeSmtpOperation<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch {
      throw new Error('SMTP operation failed');
    }
  }
}
