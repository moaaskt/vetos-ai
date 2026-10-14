import { Test, TestingModule } from '@nestjs/testing';
import { TimelineService } from './timeline.service';
import { AppointmentsProvider } from './providers/appointments.provider';
import { VaccinesProvider } from './providers/vaccines.provider';
import { WeightsProvider } from './providers/weights.provider';
import { PrescriptionsProvider } from './providers/prescriptions.provider';
import { ConsentProvider } from './providers/consent.provider';
import { AttachmentsProvider } from './providers/attachments.provider';

describe('TimelineService', () => {
  let service: TimelineService;
  let appointmentsProvider: AppointmentsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineService,
        {
          provide: AppointmentsProvider,
          useValue: {
            getEvents: jest.fn().mockResolvedValue([
              {
                id: 'app-1',
                type: 'APPOINTMENT',
                occurredAt: new Date('2026-05-10T10:00:00Z'),
                title: 'Consulta veterinária',
                icon: '🩺',
                tone: 'blue',
              },
            ]),
          },
        },
        {
          provide: VaccinesProvider,
          useValue: {
            getEvents: jest.fn().mockResolvedValue([
              {
                id: 'vac-1',
                type: 'VACCINE',
                occurredAt: new Date('2026-05-15T14:00:00Z'),
                title: 'Vacina aplicada',
                icon: '💉',
                tone: 'green',
              },
            ]),
          },
        },
        {
          provide: WeightsProvider,
          useValue: {
            getEvents: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PrescriptionsProvider,
          useValue: {
            getEvents: jest.fn().mockResolvedValue([
              {
                id: 'presc-1',
                type: 'PRESCRIPTION',
                occurredAt: new Date('2026-05-12T11:00:00Z'),
                title: 'Receita emitida',
                icon: '📄',
                tone: 'purple',
                action: {
                  label: 'Ver Receita',
                  href: '/documento/hash-123',
                },
              },
            ]),
          },
        },
        {
          provide: ConsentProvider,
          useValue: {
            getEvents: jest.fn().mockResolvedValue([
              {
                id: 'term-1',
                type: 'CONSENT',
                occurredAt: new Date('2026-05-18T16:00:00Z'),
                title: 'Termo assinado',
                icon: '✍️',
                tone: 'amber',
                action: {
                  label: 'Ver Termo',
                  href: '/documento/termo-456',
                },
              },
            ]),
          },
        },
        {
          provide: AttachmentsProvider,
          useValue: {
            getEvents: jest.fn().mockResolvedValue([
              {
                id: 'att-1',
                type: 'ATTACHMENT',
                occurredAt: new Date('2026-05-11T09:00:00Z'),
                title: 'Exame disponível',
                subtitle: 'hemograma.pdf',
                icon: '📷',
                tone: 'neutral',
              },
            ]),
          },
        },
      ],
    }).compile();

    service = module.get<TimelineService>(TimelineService);
    appointmentsProvider = module.get<AppointmentsProvider>(AppointmentsProvider);
  });

  it('deve compilar e agregar eventos ordenados por data decrescente', async () => {
    const events = await service.getTimeline('pet-test-123');

    expect(events).toBeDefined();
    expect(events.length).toBe(5);

    // Ordem decrescente esperada:
    // 1. term-1 (2026-05-18)
    // 2. vac-1 (2026-05-15)
    // 3. presc-1 (2026-05-12)
    // 4. att-1 (2026-05-11)
    // 5. app-1 (2026-05-10)
    expect(events[0].id).toBe('term-1');
    expect(events[1].id).toBe('vac-1');
    expect(events[2].id).toBe('presc-1');
    expect(events[3].id).toBe('att-1');
    expect(events[4].id).toBe('app-1');
  });

  it('deve conter as ações com links públicos para receitas e termos assinados', async () => {
    const events = await service.getTimeline('pet-test-123');

    const prescriptionEvent = events.find((e) => e.type === 'PRESCRIPTION');
    expect(prescriptionEvent?.action?.href).toBe('/documento/hash-123');

    const consentEvent = events.find((e) => e.type === 'CONSENT');
    expect(consentEvent?.action?.href).toBe('/documento/termo-456');
  });
});
