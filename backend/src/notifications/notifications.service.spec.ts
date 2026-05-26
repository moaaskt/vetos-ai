import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  const queue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    queue.add.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
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
});
