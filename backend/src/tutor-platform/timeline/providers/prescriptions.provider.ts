import { Injectable } from '@nestjs/common';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrescriptionsProvider implements TimelineProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(petId: string): Promise<TimelineEvent[]> {
    const prescriptions = await this.prisma.prescription.findMany({
      where: { petId, status: 'SIGNED' },
    });

    return prescriptions.map((p) => {
      const event: TimelineEvent = {
        id: p.id,
        type: 'PRESCRIPTION',
        occurredAt: p.signedAt || p.createdAt,
        title: 'Receita emitida',
        subtitle: p.medicamento,
        description: `${p.dosagem} - ${p.frequencia}`,
        icon: '📄',
        tone: 'purple',
      };

      if (p.documentHash) {
        event.action = {
          label: 'Ver Receita',
          href: `/documento/${p.documentHash}`,
        };
      }

      return event;
    });
  }
}
