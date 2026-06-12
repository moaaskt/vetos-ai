---
wave: 1
depends_on: ["01-PLAN.md"]
files_modified:
  - backend/package.json
  - backend/src/notifications/providers/smtp.provider.ts
  - backend/src/notifications/notifications.processor.ts
  - backend/src/notifications/notifications.module.ts
autonomous: true
---

# Phase 4 Plan 2: Wave 1B - SMTP Integration

## Goal
Introduce external SMTP complexity by implementing a real Email provider using Nodemailer. Configure SMTP settings per clinic, test connections, send test emails, and persist the results in the `NotificationLog`.

## Tasks

<task>
<id>1</id>
<title>Install Nodemailer</title>
<type>execute</type>
<read_first>
- backend/package.json
</read_first>
<action>
1. Install `nodemailer` and its types (`npm install nodemailer @types/nodemailer`).
</action>
<acceptance_criteria>
- Nodemailer is added to package.json and installed.
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Implement SmtpProvider</title>
<type>execute</type>
<read_first>
- backend/src/notifications/notifications.module.ts
</read_first>
<action>
1. Create `SmtpProvider` in `backend/src/notifications/providers`.
2. Implement logic to initialize a Nodemailer transport dynamically using credentials fetched from the `NotificationConfig` database table for a specific `clinicId`.
3. Use the `EncryptionService` to decrypt the stored SMTP password.
4. Add a method to send test emails.
</action>
<acceptance_criteria>
- SmtpProvider correctly configures Nodemailer using decrypted credentials from the database, scoped by clinicId.
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Update NotificationProcessor</title>
<type>execute</type>
<read_first>
- backend/src/notifications/notifications.processor.ts
</read_first>
<action>
1. Update `NotificationsProcessor` to use the `SmtpProvider` instead of `EmailMockProvider` when processing real EMAIL channel jobs.
2. Ensure the result (SENT or FAILED) is persisted in the `NotificationLog`.
3. Do not expose encrypted secrets in the frontend logs or errors.
</action>
<acceptance_criteria>
- Email jobs are routed to the SmtpProvider and successfully recorded in the log.
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Nodemailer correctly sends emails using the dynamically retrieved clinic configurations.
- Results are saved securely in NotificationLog.
</criteria>
</verification>

<must_haves>
- [x] Nodemailer installed
- [x] SmtpProvider functional
- [x] Dynamic SMTP configuration per clinic
- [x] Test email send capability
- [x] Result persisted in NotificationLog
</must_haves>
