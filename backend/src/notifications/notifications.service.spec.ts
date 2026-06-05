import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const queue = {
    add: jest.fn(),
    getJob: jest.fn(),
  };
  const prisma = {
    notificationTemplate: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    queue.add.mockReset();
    queue.getJob.mockReset();
    prisma.notificationTemplate.findMany.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: getQueueToken('notifications'),
          useValue: queue,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('enqueues structured notification jobs', async () => {
    await service.enqueueNotification({
      clinicId: 'clinic-1',
      channel: 'EMAIL',
      to: 'client@example.com',
      subject: 'Consulta',
      body: 'Mensagem',
      event: 'APPOINTMENT_CREATED',
      jobId: 'job-1',
      delayMs: 1000,
    });

    expect(queue.add).toHaveBeenCalledWith(
      'send-message',
      expect.objectContaining({
        clinicId: 'clinic-1',
        channel: 'EMAIL',
        to: 'client@example.com',
      }),
      {
        delay: 1000,
        jobId: 'job-1',
      },
    );
  });

  it('cancels a queued notification job when it exists', async () => {
    const job = {
      remove: jest.fn(),
    };
    queue.getJob.mockResolvedValue(job);

    await service.cancelNotificationJob('appt-24h-email-appointment-1');

    expect(queue.getJob).toHaveBeenCalledWith('appt-24h-email-appointment-1');
    expect(job.remove).toHaveBeenCalled();
  });

  it('resolves distinct active channels for an event', async () => {
    prisma.notificationTemplate.findMany.mockResolvedValue([
      { channel: 'EMAIL' },
      { channel: 'WHATSAPP' },
      { channel: 'EMAIL' },
    ]);

    await expect(
      service.getActiveChannelsForEvent('clinic-1', 'APPOINTMENT_CREATED'),
    ).resolves.toEqual(['EMAIL', 'WHATSAPP']);
    expect(prisma.notificationTemplate.findMany).toHaveBeenCalledWith({
      where: {
        clinicId: 'clinic-1',
        event: 'APPOINTMENT_CREATED',
        active: true,
      },
      select: {
        channel: true,
      },
    });
  });

  it('returns no channels when no active template exists', async () => {
    prisma.notificationTemplate.findMany.mockResolvedValue([]);

    await expect(
      service.getActiveChannelsForEvent('clinic-1', 'APPOINTMENT_CREATED'),
    ).resolves.toEqual([]);
  });
});
