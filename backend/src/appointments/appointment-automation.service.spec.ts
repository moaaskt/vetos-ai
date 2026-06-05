import { AppointmentStatus } from '@prisma/client';
import { AppointmentAutomationService } from './appointment-automation.service';

describe('AppointmentAutomationService', () => {
  const notificationsService = {
    enqueueNotification: jest.fn(),
    cancelNotificationJob: jest.fn(),
    getActiveChannelsForEvent: jest.fn(),
  };

  beforeEach(() => {
    notificationsService.enqueueNotification.mockReset();
    notificationsService.cancelNotificationJob.mockReset();
    notificationsService.getActiveChannelsForEvent.mockReset();
    notificationsService.getActiveChannelsForEvent.mockResolvedValue([]);
  });

  it('enqueues created and reminder jobs with predictable IDs', async () => {
    const service = new AppointmentAutomationService(
      notificationsService as any,
    );
    const appointment = buildAppointment({
      date: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    await service.onAppointmentCreated(appointment as any);

    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_CREATED',
        channel: 'EMAIL',
        jobId: 'appt-created-email-appointment-1',
      }),
    );
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_REMINDER_24H',
        channel: 'EMAIL',
        jobId: 'appt-24h-email-appointment-1',
        delayMs: expect.any(Number),
      }),
    );
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_REMINDER_2H',
        channel: 'EMAIL',
        jobId: 'appt-2h-email-appointment-1',
        delayMs: expect.any(Number),
      }),
    );
  });

  it('enqueues one appointment-created job per active EMAIL and WHATSAPP template', async () => {
    notificationsService.getActiveChannelsForEvent.mockResolvedValue([
      'EMAIL',
      'WHATSAPP',
    ]);
    const service = new AppointmentAutomationService(
      notificationsService as any,
    );
    const appointment = buildAppointment({
      client: buildClient({ phone: '+5511999999999' }),
      pet: buildPet({ client: buildClient({ phone: '+5511999999999' }) }),
    });

    await service.onAppointmentCreated(appointment as any);

    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_CREATED',
        channel: 'EMAIL',
        to: 'ana@example.com',
        jobId: 'appt-created-email-appointment-1',
      }),
    );
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_CREATED',
        channel: 'WHATSAPP',
        to: '+5511999999999',
        jobId: 'appt-created-whatsapp-appointment-1',
      }),
    );
  });

  it('enqueues only EMAIL when only EMAIL is active', async () => {
    notificationsService.getActiveChannelsForEvent.mockResolvedValue(['EMAIL']);
    const service = new AppointmentAutomationService(
      notificationsService as any,
    );

    await service.onAppointmentCreated(buildAppointment() as any);

    expect(
      notificationsService.enqueueNotification.mock.calls.some(
        ([input]) => input.channel === 'WHATSAPP',
      ),
    ).toBe(false);
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_CREATED',
        channel: 'EMAIL',
      }),
    );
  });

  it('enqueues only WHATSAPP when only WHATSAPP is active', async () => {
    notificationsService.getActiveChannelsForEvent.mockResolvedValue([
      'WHATSAPP',
    ]);
    const service = new AppointmentAutomationService(
      notificationsService as any,
    );
    const appointment = buildAppointment({
      client: buildClient({ email: null, phone: '+5511999999999' }),
      pet: buildPet({
        client: buildClient({ email: null, phone: '+5511999999999' }),
      }),
    });

    await service.onAppointmentCreated(appointment as any);

    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_CREATED',
        channel: 'WHATSAPP',
        to: '+5511999999999',
        jobId: 'appt-created-whatsapp-appointment-1',
      }),
    );
    expect(
      notificationsService.enqueueNotification.mock.calls.some(
        ([input]) => input.channel === 'EMAIL',
      ),
    ).toBe(false);
  });

  it('enqueues active WHATSAPP with empty recipient so processor can log missing phone', async () => {
    notificationsService.getActiveChannelsForEvent.mockResolvedValue([
      'WHATSAPP',
    ]);
    const service = new AppointmentAutomationService(
      notificationsService as any,
    );

    await service.onAppointmentCreated(buildAppointment() as any);

    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_CREATED',
        channel: 'WHATSAPP',
        to: '',
        jobId: 'appt-created-whatsapp-appointment-1',
      }),
    );
  });

  it('skips delayed reminder jobs when their send time is already past', async () => {
    const service = new AppointmentAutomationService(
      notificationsService as any,
    );
    const appointment = buildAppointment({
      date: new Date(Date.now() + 60 * 60 * 1000),
    });

    await service.onAppointmentCreated(appointment as any);

    expect(notificationsService.enqueueNotification).toHaveBeenCalledTimes(1);
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_CREATED',
      }),
    );
  });

  it('cancels all predictable appointment jobs on cancellation', async () => {
    const service = new AppointmentAutomationService(
      notificationsService as any,
    );

    await service.onAppointmentCancelled('appointment-1');

    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-created-email-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-created-whatsapp-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-24h-email-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-24h-whatsapp-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-2h-email-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-2h-whatsapp-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-follow-up-email-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-follow-up-whatsapp-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledTimes(8);
  });
});

function buildAppointment(overrides: Partial<Record<string, unknown>> = {}) {
  const client = buildClient();
  const pet = buildPet({ client });

  return {
    id: 'appointment-1',
    date: new Date(Date.now() + 48 * 60 * 60 * 1000),
    reason: 'Consulta',
    status: AppointmentStatus.SCHEDULED,
    petId: 'pet-1',
    clientId: 'client-1',
    clinicId: 'clinic-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    notifiedAt: null,
    pet,
    client,
    ...overrides,
  };
}

function buildClient(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'client-1',
    name: 'Ana',
    email: 'ana@example.com',
    phone: null,
    clinicId: 'clinic-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function buildPet(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'pet-1',
    name: 'Rex',
    species: 'Canino',
    breed: null,
    age: null,
    clientId: 'client-1',
    clinicId: 'clinic-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    client: buildClient(),
    ...overrides,
  };
}
