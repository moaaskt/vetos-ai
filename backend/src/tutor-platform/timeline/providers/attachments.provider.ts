import { Injectable } from '@nestjs/common';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AttachmentsProvider implements TimelineProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(petId: string): Promise<TimelineEvent[]> {
    const attachments = await this.prisma.clinicalAttachment.findMany({
      where: { petId, visibleToTutor: true },
    });

    return attachments.map((att) => {
      const event: TimelineEvent = {
        id: att.id,
        type: 'ATTACHMENT',
        occurredAt: att.createdAt,
        title: 'Exame disponível',
        subtitle: att.originalFileName,
        description: att.notes || undefined,
        icon: '📷',
        tone: 'neutral',
      };

      // Since we don't have a public document route for attachments yet, 
      // we might just omit action or provide an api download link
      // event.action = { label: 'Baixar Exame', href: `/api/attachments/${att.id}/download` };

      return event;
    });
  }
}
