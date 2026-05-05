---
wave: 1
depends_on: []
files_modified:
  - backend/package.json
  - backend/src/notifications/notifications.module.ts
  - backend/src/notifications/notifications.service.ts
  - backend/src/notifications/whatsapp-mock.provider.ts
  - backend/src/scheduler/scheduler.module.ts
  - backend/src/scheduler/scheduler.service.ts
  - backend/src/app.module.ts
autonomous: true
---

# Phase 4 Plan 1: Automation and Notifications Core

## Goal
Transform the system into an intelligent SaaS by implementing a background notification system, scheduled tasks for reminders, and a mock WhatsApp integration for simulation.

## Tasks

<task>
<id>1</id>
<title>Setup Background Queues (BullMQ)</title>
<type>execute</type>
<read_first>
- backend/package.json
</read_first>
<action>
1. Install BullMQ and Redis dependencies: `npm install bullmq ioredis @nestjs/bullmq`.
2. Configure `BullModule` in `AppModule` to connect to the local Redis container (`localhost:6379`).
3. Register a `notifications` queue.
</action>
<acceptance_criteria>
- BullModule is correctly configured and connects to Redis
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Implement Notification Module and Mock WhatsApp</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
</read_first>
<action>
1. Generate `NotificationsModule` and `NotificationsService`.
2. Create `WhatsAppMockProvider` that logs messages to the console (simulating an external API call).
3. Implement a `NotificationProcessor` to consume the `notifications` queue and "send" messages via the mock provider.
</action>
<acceptance_criteria>
- Messages added to the queue are processed and logged to the console
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Setup Scheduler and Appointment Reminders</title>
<type>execute</type>
<read_first>
- backend/src/appointments/appointments.service.ts
</read_first>
<action>
1. Install NestJS Schedule: `npm install @nestjs/schedule`.
2. Create `SchedulerModule` and `SchedulerService`.
3. Implement a Cron job (`@Cron('0 * * * *')` - every hour) that:
   - Finds appointments scheduled for the next 24 hours.
   - Checks if a reminder was already sent.
   - Enqueues a notification task for the client.
</action>
<acceptance_criteria>
- Cron job runs and identifies upcoming appointments correctly
- Notifications are enqueued for valid appointments
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Rules Engine: Inactive Client Detection</title>
<type>execute</type>
<read_first>
- backend/src/clients/clients.service.ts
</read_first>
<action>
1. Implement a separate Cron job (e.g., daily) in `SchedulerService`.
2. Identify clients whose last appointment was more than 90 days ago.
3. Enqueue a "Retention" notification message for these clients.
</action>
<acceptance_criteria>
- Logic correctly identifies inactive clients without manual intervention
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Redis connection is stable
- Notification processor logs simulated WhatsApp messages
- Scheduler enqueues tasks based on business rules (reminders/retention)
</criteria>
</verification>

<must_haves>
- [x] Background processing with BullMQ
- [x] Automated Appointment Reminders
- [x] Inactive Client Detection
</must_haves>
