import { Controller, Get, Post, Query, Body, HttpCode, HttpStatus, Logger, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('webhooks/meta-whatsapp')
export class MetaWebhookController {
  private readonly logger = new Logger(MetaWebhookController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Endpoint de validação exigido pela Meta para registro do Webhook.
   * A Meta envia:
   * hub.mode = "subscribe"
   * hub.challenge = "<string randômica>"
   * hub.verify_token = "<token configurado no painel da Meta>"
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const configuredToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && verifyToken === configuredToken) {
      this.logger.log('Meta WhatsApp Webhook verificado com sucesso.');
      return res.status(HttpStatus.OK).send(challenge);
    }

    this.logger.warn(`Falha na verificação do Meta Webhook: token inválido (${verifyToken})`);
    return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
  }

  /**
   * Endpoint de recebimento de notificações e status de mensagens enviadas.
   * Status possíveis da Meta: sent, delivered, read, failed.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhookPayload(@Body() body: any) {
    // Sempre retornar 200 OK imediatamente para a Meta não retentar continuamente
    try {
      if (body.object !== 'whatsapp_business_account' && !body.entry) {
        return { status: 'ignored' };
      }

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;
          if (!value) continue;

          // Processar atualizações de status
          if (Array.isArray(value.statuses)) {
            for (const statusObj of value.statuses) {
              await this.processStatusUpdate(statusObj);
            }
          }
        }
      }

      return { status: 'processed' };
    } catch (err: any) {
      this.logger.error(`Erro ao processar payload do Meta Webhook: ${err.message}`, err.stack);
      return { status: 'error_handled' };
    }
  }

  private async processStatusUpdate(statusObj: any) {
    const metaMessageId = statusObj.id;
    const metaStatus = statusObj.status; // sent, delivered, read, failed
    const timestamp = statusObj.timestamp ? new Date(parseInt(statusObj.timestamp, 10) * 1000) : new Date();

    if (!metaMessageId) return;

    // Buscar log correspondente via índice no metaMessageId
    const log = await this.prisma.notificationLog.findFirst({
      where: { metaMessageId },
    });

    if (!log) {
      this.logger.debug(`NotificationLog não encontrado para metaMessageId: ${metaMessageId}`);
      return;
    }

    let mappedStatus = log.status;
    let errorMessage = log.errorMessage;

    switch (metaStatus) {
      case 'sent':
      case 'delivered':
      case 'read':
        mappedStatus = 'SENT';
        break;
      case 'failed':
        mappedStatus = 'FAILED';
        if (Array.isArray(statusObj.errors) && statusObj.errors.length > 0) {
          const err = statusObj.errors[0];
          errorMessage = `Meta Error [${err.code}]: ${err.title || err.message}`;
        }
        break;
    }

    await this.prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: mappedStatus as any,
        errorMessage,
        sentAt: mappedStatus === 'SENT' && !log.sentAt ? timestamp : log.sentAt,
      },
    });

    this.logger.log(`Status de mensagem Meta atualizado: ID ${metaMessageId} -> ${metaStatus} (Log: ${log.id})`);
  }
}
