import { Injectable } from '@nestjs/common';
import { TimelineEvent } from './dto/timeline-event.dto';
import { AppointmentsProvider } from './providers/appointments.provider';
import { VaccinesProvider } from './providers/vaccines.provider';
import { WeightsProvider } from './providers/weights.provider';
import { PrescriptionsProvider } from './providers/prescriptions.provider';
import { ConsentProvider } from './providers/consent.provider';
import { AttachmentsProvider } from './providers/attachments.provider';

@Injectable()
export class TimelineService {
  constructor(
    private readonly appointmentsProvider: AppointmentsProvider,
    private readonly vaccinesProvider: VaccinesProvider,
    private readonly weightsProvider: WeightsProvider,
    private readonly prescriptionsProvider: PrescriptionsProvider,
    private readonly consentProvider: ConsentProvider,
    private readonly attachmentsProvider: AttachmentsProvider,
  ) {}

  async getTimeline(petId: string): Promise<TimelineEvent[]> {
    const [
      appointments,
      vaccines,
      weights,
      prescriptions,
      consents,
      attachments,
    ] = await Promise.all([
      this.appointmentsProvider.getEvents(petId),
      this.vaccinesProvider.getEvents(petId),
      this.weightsProvider.getEvents(petId),
      this.prescriptionsProvider.getEvents(petId),
      this.consentProvider.getEvents(petId),
      this.attachmentsProvider.getEvents(petId),
    ]);

    const allEvents = [
      ...appointments,
      ...vaccines,
      ...weights,
      ...prescriptions,
      ...consents,
      ...attachments,
    ];

    // Ordenar por data decrescente (mais recente primeiro)
    return allEvents.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }
}
