import { AppointmentStatus } from '@prisma/client';
import { AppointmentAutomationService } from './appointment-automation.service';

describe('AppointmentAutomationService', () => {
  const notificationsService = {
    enqueueNotification: jest.fn(),
    cancelNotificationJob: jest.fn(),
  };

  beforeEach(() => {
    notificationsService.enqueueNotification.mockReset();
    notificationsService.cancelNotificationJob.mockReset();
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
        jobId: 'appt-created-appointment-1',
      }),
    );
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_REMINDER_24H',
        jobId: 'appt-24h-appointment-1',
        delayMs: expect.any(Number),
      }),
    );
    expect(notificationsService.enqueueNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'APPOINTMENT_REMINDER_2H',
        jobId: 'appt-2h-appointment-1',
        delayMs: expect.any(Number),
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
      'appt-created-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-24h-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-2h-appointment-1',
    );
    expect(notificationsService.cancelNotificationJob).toHaveBeenCalledWith(
      'appt-follow-up-appointment-1',
    );
  });
});

function buildAppointment(overrides: Partial<Record<string, unknown>> = {}) {
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
    pet: {
      id: 'pet-1',
      name: 'Rex',
      species: 'Canino',
      breed: null,
      age: null,
      clientId: 'client-1',
      clinicId: 'clinic-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      client: {
        id: 'client-1',
        name: 'Ana',
        email: 'ana@example.com',
        phone: null,
        clinicId: 'clinic-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    client: {
      id: 'client-1',
      name: 'Ana',
      email: 'ana@example.com',
      phone: null,
      clinicId: 'clinic-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ...overrides,
  };
}
