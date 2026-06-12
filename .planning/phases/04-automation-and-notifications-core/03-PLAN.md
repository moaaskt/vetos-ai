---
wave: 2
depends_on: ["02-PLAN.md"]
files_modified:
  - backend/src/appointments/appointment-automation.service.ts
  - backend/src/appointments/appointments.service.ts
  - backend/src/appointments/appointments.module.ts
  - backend/src/notifications/notifications.processor.ts
  - backend/src/scheduler/scheduler.module.ts
  - backend/src/scheduler/scheduler.service.ts
  - backend/src/vaccines/vaccines.service.ts
  - backend/src/vaccines/vaccines.module.ts
autonomous: true
---

# Phase 4 Plan 3: Wave 2 - Veterinary Automations and Hybrid Scheduler

## Goal
Implement the core veterinary automations using a hybrid scheduling strategy (BullMQ + Cron) with robust validation. Establish a dedicated `AppointmentAutomationService`, implement duplicate prevention via `NotificationLog`, validate appointment states before sending, use date windows for cron queries, and gracefully handle missing notification configurations. This wave is strictly backend-only.

## Tasks

<task>
<id>1</id>
<title>Appointment Automation Service</title>
<type>execute</type>
<read_first>
- backend/src/appointments/appointments.service.ts
</read_first>
<action>
1. Create `AppointmentAutomationService` inside the `appointments` module.
2. Move all scheduling logic out of `AppointmentsService`. The `AppointmentsService` should only call `AutomationService.onAppointmentCreated()`, `onAppointmentUpdated()`, or `onAppointmentCancelled()`.
3. In the Automation Service, calculate reminder times (24h, 2h) and follow-up times. If a calculated reminder time is already in the past (e.g., appointment is 1 hour from now, so 24h reminder is past), safely skip enqueueing that specific job.
4. Manage job lifecycle using predictable `jobId`s to seamlessly cancel or reschedule jobs when appointment dates or statuses change.
</action>
<acceptance_criteria>
- Separation of concerns is maintained: `AppointmentsService` handles business logic, `AppointmentAutomationService` handles job scheduling.
- Past reminder jobs are intelligently skipped.
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Notification Processor Enhancements</title>
<type>execute</type>
<read_first>
- backend/src/notifications/notifications.processor.ts
</read_first>
<action>
1. Update `NotificationsProcessor` to perform real-time validation before sending appointment reminders.
2. Re-fetch the appointment from the database. Ensure it still exists, its status is `SCHEDULED`, the scheduled date hasn't changed, and the client has contact info. Skip sending if invalid.
3. Prevent duplicate sends: Query `NotificationLog` to verify if a log already exists for the specific event (`APPOINTMENT_REMINDER_24H`, `APPOINTMENT_REMINDER_2H`, `APPOINTMENT_FOLLOW_UP`) and `appointmentId`. If so, skip.
4. Graceful degradation: If the `NotificationConfig` is missing or lacks SMTP credentials, do not crash the job. Instead, create a `FAILED` record in `NotificationLog` with a descriptive error.
</action>
<acceptance_criteria>
- Reminders are never sent for cancelled/completed appointments.
- Duplicate reminders are prevented.
- Missing configurations result in graceful FAILED logs rather than app crashes.
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Daily Cron for Vaccines</title>
<type>execute</type>
<read_first>
- backend/src/scheduler/scheduler.service.ts
- backend/src/vaccines/vaccines.service.ts
</read_first>
<action>
1. Create a Cron job (`@Cron(CronExpression.EVERY_DAY_AT_2AM)`) in `SchedulerService`.
2. Query Prisma for vaccines where `nextDoseDate` is within a window (e.g., between `now` and `now + 7 days`).
3. For each expiring vaccine, check `NotificationLog` to ensure a reminder wasn't already sent recently to prevent duplicates.
4. Enqueue notification jobs using the existing mock/SMTP providers.
</action>
<acceptance_criteria>
- Cron uses a date window instead of precise days to avoid skipping records.
- Notifications are correctly enqueued without spamming duplicates.
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Daily Cron for Inactive Clients (Retention)</title>
<type>execute</type>
<read_first>
- backend/src/scheduler/scheduler.service.ts
</read_first>
<action>
1. Extend the daily Cron job for client retention.
2. Query clients whose last appointment was > 90 days ago.
3. Anti-spam check: Query `NotificationLog` to ensure the client has not received a `RETENTION` event in the last 90 days for the same `clinicId`.
4. Enqueue retention notification jobs for eligible clients using existing providers.
</action>
<acceptance_criteria>
- Inactive clients are identified accurately.
- Spam is strictly prevented by enforcing the 90-day cooldown via `NotificationLog`.
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Job lifecycle cleanly separates from business logic via `AppointmentAutomationService`.
- Past jobs are dynamically skipped.
- Real-time DB validation within the queue processor successfully intercepts cancelled/completed appointments before sending.
- Cron jobs process windows accurately without spamming clients due to `NotificationLog` deduplication.
</criteria>
</verification>

<must_haves>
- [ ] Dedicated AppointmentAutomationService
- [ ] Real-time appointment validation in processor
- [ ] Duplicate prevention via NotificationLog
- [ ] Past time skip logic
- [ ] Window-based vaccine cron
- [ ] 90-day anti-spam retention cron
- [ ] Graceful FAILED logs for missing SMTP config
</must_haves>
