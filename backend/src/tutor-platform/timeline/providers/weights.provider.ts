import { Injectable } from '@nestjs/common';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class WeightsProvider implements TimelineProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(petId: string): Promise<TimelineEvent[]> {
    const weights = await this.prisma.weightRecord.findMany({
      where: { petId },
    });

    return weights.map((w) => ({
      id: w.id,
      type: 'WEIGHT',
      occurredAt: w.date,
      title: 'Peso atualizado',
      subtitle: `${w.weight} kg`,
      icon: '📈',
      tone: 'neutral',
    }));
  }
}
