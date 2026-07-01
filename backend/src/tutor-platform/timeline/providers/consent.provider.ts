import { Injectable } from '@nestjs/common';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ConsentProvider implements TimelineProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(petId: string): Promise<TimelineEvent[]> {
    const terms = await this.prisma.consentTerm.findMany({
      where: { petId, status: 'SIGNED' },
      include: { consentTemplate: true },
    });

    return terms.map((t) => {
      const event: TimelineEvent = {
        id: t.id,
        type: 'CONSENT',
        occurredAt: t.signedAt || t.createdAt,
        title: 'Termo assinado',
        subtitle: t.consentTemplate?.name || 'Termo de Consentimento',
        icon: '✍️',
        tone: 'amber',
      };

      if (t.documentHash) {
        event.action = {
          label: 'Ver Termo',
          href: `/documento/${t.documentHash}`,
        };
      }

      return event;
    });
  }
}
