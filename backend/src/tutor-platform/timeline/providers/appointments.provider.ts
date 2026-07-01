import { Injectable } from '@nestjs/common';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AppointmentsProvider implements TimelineProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(petId: string): Promise<TimelineEvent[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { petId, status: 'COMPLETED' },
      include: { clinic: true },
    });

    return appointments.map((appt) => ({
      id: appt.id,
      type: 'APPOINTMENT',
      occurredAt: appt.date,
      title: 'Consulta realizada',
      subtitle: appt.clinic.name,
      description: appt.reason || 'Consulta de rotina',
      icon: '🩺',
      tone: 'blue',
    }));
  }
}
