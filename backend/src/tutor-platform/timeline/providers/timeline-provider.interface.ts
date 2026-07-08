import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

export interface TimelineProvider {
  getEvents(petId: string): Promise<TimelineEvent[]>;
}
