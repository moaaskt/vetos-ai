import { Injectable } from '@nestjs/common';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class VaccinesProvider implements TimelineProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(petId: string): Promise<TimelineEvent[]> {
    const vaccines = await this.prisma.vaccineRecord.findMany({
      where: { petId, status: 'APPLIED' },
    });

    const events: TimelineEvent[] = vaccines.map((vac) => ({
      id: vac.id,
      type: 'VACCINE',
      occurredAt: vac.date,
      title: 'Vacina aplicada',
      subtitle: vac.name,
      icon: '💉',
      tone: 'green',
    }));

    // Optionally include SCHEDULED vaccines as a "Next Vaccine" event, but the prompt suggested "história", so maybe past vaccines.
    // Wait, the user mentioned "Próxima vacina" in the prompt. Let's include scheduled ones too.
    const scheduledVaccines = await this.prisma.vaccineRecord.findMany({
      where: { petId, status: 'SCHEDULED' },
    });

    for (const vac of scheduledVaccines) {
      if (vac.nextDoseDate) {
        events.push({
          id: `${vac.id}-scheduled`,
          type: 'VACCINE',
          occurredAt: vac.nextDoseDate,
          title: 'Próxima vacina',
          subtitle: vac.name,
          icon: '⏰',
          tone: 'amber',
        });
      }
    }

    return events;
  }
}
