import { Injectable } from '@nestjs/common';
import { TimelineProvider } from './timeline-provider.interface';
import { TimelineEvent } from '../dto/timeline-event.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AppointmentsProvider implements TimelineProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(petId: string): Promise<TimelineEvent[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { 
        petId,
        status: { in: ['COMPLETED', 'SCHEDULED'] }
      },
      include: { clinic: true },
    });

    return appointments.map((appt) => {
      const isScheduled = appt.status === 'SCHEDULED';
      return {
        id: appt.id,
        type: 'APPOINTMENT',
        occurredAt: appt.date,
        title: isScheduled ? 'Consulta agendada' : 'Consulta realizada',
        subtitle: appt.clinic.name,
        description: appt.reason || (isScheduled ? 'Consulta agendada' : 'Consulta de rotina'),
        icon: isScheduled ? '⏰' : '🩺',
        tone: isScheduled ? 'amber' : 'blue',
      };
    });
  }
}
