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
  };

  beforeEach(async () => {
    prisma.vaccineRecord.findMany.mockReset();
    prisma.notificationLog.findFirst.mockReset();
    prisma.client.findMany.mockReset();
    notificationsService.enqueueNotification.mockReset();

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

  it('enqueues vaccine reminders using a date window and log dedupe', async () => {
    const nextDoseDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    prisma.vaccineRecord.findMany.mockResolvedValue([
      {
        id: 'vaccine-1',
        name: 'V10',
        nextDoseDate,
        clinicId: 'clinic-1',
        petId: 'pet-1',
        pet: {
          id: 'pet-1',
          name: 'Rex',
          clientId: 'client-1',
          client: {
            email: 'client@example.com',
            phone: null,
          },
        },
      },
    ]);
    prisma.notificationLog.findFirst.mockResolvedValue(null);

    await service.enqueueVaccineReminders();

    expect(prisma.vaccineRecord.findMany).toHaveBeenCalledWith({
      where: {
        nextDoseDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      },
      include: {
        pet: {
          include: {
            client: true,
          },
        },
      },
    });
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        clinicId: 'clinic-1',
        event: 'VACCINE_EXPIRATION',
        petId: 'pet-1',
        clientId: 'client-1',
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
