---
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/encryption/encryption.service.ts
  - backend/src/encryption/encryption.module.ts
  - backend/src/notifications/notifications.module.ts
  - backend/src/notifications/notifications.service.ts
  - backend/src/notifications/notifications.processor.ts
  - backend/src/notifications/providers/email-mock.provider.ts
  - backend/src/notifications/providers/whatsapp-mock.provider.ts
  - backend/src/notifications/template.service.ts
autonomous: true
---

# Phase 4 Plan 1: Wave 1A - Safe Foundation

## Goal
Establish a safe foundation for the Automation & Notifications Core. This includes updating the Prisma schema for multi-tenant configuration, implementing symmetric encryption, configuring the BullMQ message queue, creating the TemplateService, and setting up mock providers for both EMAIL and WHATSAPP. No external network calls or real SMTP integrations are implemented in this wave.

## Tasks

<task>
<id>1</id>
<title>Prisma Schema Updates</title>
<type>execute</type>
<read_first>
- backend/prisma/schema.prisma
</read_first>
<action>
1. Add `NotificationConfig` model (clinicId, SMTP configs, WhatsApp configs, enable flags). All data scoped by clinicId.
2. Add `NotificationTemplate` model (clinicId, event enum string, channel, subject, body).
3. Add `NotificationLog` model (clinicId, channel, to, subject, body, status, errorMessage, event, scheduledFor, sentAt, relationships to appointment/client/pet).
4. Run `npx prisma format` and `npx prisma db push` (or migrate dev) to update the database schema.
5. Generate the Prisma client.
</action>
<acceptance_criteria>
- Schema correctly reflects the multi-tenant design, scoped by clinicId.
- Prisma client is updated and types are available.
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Encryption Service</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
</read_first>
<action>
1. Create `EncryptionModule` and `EncryptionService` in `backend/src/encryption`.
2. Implement symmetric encryption (e.g., `aes-256-gcm`) using the native Node.js `crypto` module.
3. Use an `ENCRYPTION_KEY` from environment variables (fallback to a generated 32-byte key for local dev if missing).
4. Expose `encrypt(text: string): string` and `decrypt(encryptedText: string): string` methods.
</action>
<acceptance_criteria>
- Encryption service correctly encrypts and decrypts strings.
- Key is loaded securely from the environment.
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Template Engine</title>
<type>execute</type>
<read_first>
- backend/src/notifications/notifications.module.ts
</read_first>
<action>
1. Create `TemplateService` within the `notifications` module.
2. Implement a method to compile dynamic templates by replacing placeholders like `{{client_name}}`, `{{pet_name}}`, `{{appointment_time}}`, `{{clinic_name}}` with actual values passed in a payload object.
</action>
<acceptance_criteria>
- Placeholders in a text string are correctly replaced by dynamic data.
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Queue and Mock Providers</title>
<type>execute</type>
<read_first>
- backend/src/notifications/notifications.processor.ts
</read_first>
<action>
1. Ensure `BullModule` is properly registered for the `notifications` queue.
2. Create `EmailMockProvider` and `WhatsAppMockProvider` to format logs clearly and return a mock success payload.
3. Update `NotificationsProcessor` to route jobs to either the EMAIL mock provider or WHATSAPP mock provider based on the job's channel specification.
4. Ensure the processor creates a `NotificationLog` record (status SENT or FAILED) after processing.
</action>
<acceptance_criteria>
- Queue processor handles both EMAIL and WHATSAPP channels without real external network calls.
- Notification logs are properly recorded in the database.
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Prisma schema is applied without errors.
- Encryption service handles encryption/decryption roundtrip successfully.
- Template engine replaces all placeholders correctly.
- Enqueueing an email or whatsapp job triggers the respective mock provider and records a log.
</criteria>
</verification>

<must_haves>
- [x] Database schema updated
- [x] Encryption service functional
- [x] Template compilation working
- [x] Processor routing to EMAIL and WHATSAPP mocks
- [x] Audit logs (NotificationLog) created on send
</must_haves>
