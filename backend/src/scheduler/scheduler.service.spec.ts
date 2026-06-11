import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('SchedulerService', () => {
  let service: SchedulerService;

  const prisma = {
    vaccineRecord: {
      findMany: jest.fn(),
    },
    notificationLog: {
      findFirst: jest.fn(),
    },
    client: {
      findMany: jest.fn(),
    },
  };
  const notificationsService = {
    enqueueNotification: jest.fn(),
    getActiveChannelsForEvent: jest.fn(),
  };

  beforeEach(async () => {
    prisma.vaccineRecord.findMany.mockReset();
    prisma.notificationLog.findFirst.mockReset();
    prisma.client.findMany.mockReset();
    notificationsService.enqueueNotification.mockReset();
    notificationsService.getActiveChannelsForEvent.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('enqueues vaccine reminders for D0, D-1 and D-7 targets when channels are active', async () => {
    const now = new Date();
    
    // D0 (Hoje UTC), D-1 (Amanhã UTC), D-7 (Daqui a 7 dias UTC)
    const d0Date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const d1Date = new Date(d0Date);
    d1Date.setUTCDate(d1Date.getUTCDate() + 1);
    const d7Date = new Date(d0Date);
    d7Date.setUTCDate(d7Date.getUTCDate() + 7);

    prisma.vaccineRecord.findMany.mockResolvedValue([
      {
        id: 'vac-d0',
        name: 'Anti-rábica',
        nextDoseDate: d0Date,
        clinicId: 'clinic-1',
        petId: 'pet-1',
        pet: {
          id: 'pet-1',
          name: 'Rex',
          clientId: 'client-1',
          client: {
            name: 'Ana',
            email: 'ana@example.com',
            phone: '+5511999999999',
          },
        },
        clinic: { name: 'Vet Clinic' },
      },
      {
        id: 'vac-d1',
        name: 'Gripe Canine',
        nextDoseDate: d1Date,
        clinicId: 'clinic-1',
        petId: 'pet-2',
        pet: {
          id: 'pet-2',
          name: 'Mel',
          clientId: 'client-2',
          client: {
            name: 'Carlos',
            email: 'carlos@example.com',
            phone: null,
          },
        },
        clinic: { name: 'Vet Clinic' },
      },
      {
        id: 'vac-d7',
        name: 'V10',
        nextDoseDate: d7Date,
        clinicId: 'clinic-1',
        petId: 'pet-3',
        pet: {
          id: 'pet-3',
          name: 'Thor',
          clientId: 'client-3',
          client: {
            name: 'Maria',
            email: null,
            phone: '+5511888888888',
          },
        },
        clinic: { name: 'Vet Clinic' },
      },
    ]);

    // Canais ativos: EMAIL e WHATSAPP para todos
    notificationsService.getActiveChannelsForEvent.mockResolvedValue(['EMAIL', 'WHATSAPP']);
    prisma.notificationLog.findFirst.mockResolvedValue(null);

    await service.enqueueVaccineReminders();

    // vac-d0 deve tentar enviar EMAIL e WHATSAPP (pois possui ambos os contatos)
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-1',
        event: 'VACCINE_REMINDER_DAY',
        channel: 'EMAIL',
        vaccineRecordId: 'vac-d0',
        jobId: 'vaccine-day-email-vac-d0',
      }),
    );
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-1',
        event: 'VACCINE_REMINDER_DAY',
        channel: 'WHATSAPP',
        vaccineRecordId: 'vac-d0',
        jobId: 'vaccine-day-whatsapp-vac-d0',
      }),
    );

    // vac-d1 deve tentar enviar apenas EMAIL (pois phone é null)
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-1',
        event: 'VACCINE_REMINDER_1D',
        channel: 'EMAIL',
        vaccineRecordId: 'vac-d1',
        jobId: 'vaccine-1d-email-vac-d1',
      }),
    );
    expect(notificationsService.enqueueNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        vaccineRecordId: 'vac-d1',
        channel: 'WHATSAPP',
      }),
    );

    // vac-d7 deve tentar enviar apenas WHATSAPP (pois email é null)
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-1',
        event: 'VACCINE_REMINDER_7D',
        channel: 'WHATSAPP',
        vaccineRecordId: 'vac-d7',
        jobId: 'vaccine-7d-whatsapp-vac-d7',
      }),
    );
    expect(notificationsService.enqueueNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        vaccineRecordId: 'vac-d7',
        channel: 'EMAIL',
      }),
    );
  });

  it('performs structured anti-duplication check using vaccineRecordId, event and channel', async () => {
    const now = new Date();
    const d0Date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    prisma.vaccineRecord.findMany.mockResolvedValue([
      {
        id: 'vac-1',
        name: 'V10',
        nextDoseDate: d0Date,
        clinicId: 'clinic-1',
        petId: 'pet-1',
        pet: {
          id: 'pet-1',
          name: 'Rex',
          clientId: 'client-1',
          client: {
            name: 'Ana',
            email: 'ana@example.com',
            phone: '+5511999999999',
          },
        },
        clinic: { name: 'Vet Clinic' },
      },
    ]);

    notificationsService.getActiveChannelsForEvent.mockResolvedValue(['EMAIL', 'WHATSAPP']);

    // Mock para findFirst: simula que o EMAIL já foi enviado no log, mas o WHATSAPP não
    prisma.notificationLog.findFirst.mockImplementation((args) => {
      if (args.where.channel === 'EMAIL' && args.where.vaccineRecordId === 'vac-1') {
        return Promise.resolve({ id: 'existing-log' });
      }
      return Promise.resolve(null);
    });

    await service.enqueueVaccineReminders();

    // Deve checar a duplicação usando vaccineRecordId estruturado
    expect(prisma.notificationLog.findFirst).toHaveBeenCalledWith({
      where: {
        clinicId: 'clinic-1',
        event: 'VACCINE_REMINDER_DAY',
        channel: 'EMAIL',
        vaccineRecordId: 'vac-1',
        status: 'SENT',
      },
    });

    // EMAIL já enviado: não deve re-enfileirar
    expect(notificationsService.enqueueNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'EMAIL',
        vaccineRecordId: 'vac-1',
      }),
    );

    // WHATSAPP não enviado: deve enfileirar
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'WHATSAPP',
        vaccineRecordId: 'vac-1',
      }),
    );
  });

  it('enforces the retention cooldown before enqueueing', async () => {
    prisma.client.findMany.mockResolvedValue([
      {
        id: 'client-1',
        name: 'Ana',
        email: null,
        phone: '+5511999999999',
        clinicId: 'clinic-1',
        appointments: [{ date: new Date('2025-01-01T00:00:00.000Z') }],
      },
    ]);
    prisma.notificationLog.findFirst.mockResolvedValue({ id: 'log-1' });

    await service.enqueueRetentionReminders();

    expect(prisma.notificationLog.findFirst).toHaveBeenCalledWith({
      where: {
        clinicId: 'clinic-1',
        event: 'RETENTION',
        clientId: 'client-1',
        status: 'SENT',
        createdAt: {
          gte: expect.any(Date),
        },
      },
    });
    expect(notificationsService.enqueueNotification).not.toHaveBeenCalled();
  });
});
