---
wave: 3
depends_on: ["03-PLAN.md"]
files_modified:
  - backend/package.json
  - backend/src/notifications/providers/evolution-api.provider.ts
  - backend/src/notifications/notifications.processor.ts
  - backend/src/notifications/notifications.controller.ts
  - frontend/src/api/notifications.ts
  - frontend/src/pages/super-admin/NotificationsConfig.tsx
  - frontend/src/pages/super-admin/NotificationsLogs.tsx
  - frontend/src/routes/index.tsx
autonomous: true
---

# Phase 4 Plan 4: Wave 3 - Evolution API Integration & Frontend Dashboard

## Goal
Replace the mock WhatsApp integration with a real connection to the Evolution API and build the React frontend views for administrators to configure notifications, manage templates, and monitor/retry sent messages.

## Tasks

<task>
<id>1</id>
<title>Evolution API Integration</title>
<type>execute</type>
<read_first>
- backend/src/notifications/notifications.processor.ts
</read_first>
<action>
1. Install HTTP module in backend (`npm install @nestjs/axios axios`).
2. Create `EvolutionApiProvider` that makes real HTTP POST requests to the Evolution API (`/message/sendText`).
3. Update `NotificationsProcessor` to use the real Evolution API provider instead of the mock when the channel is `WHATSAPP`.
4. Ensure failures are caught and recorded correctly in `NotificationLog`.
</action>
<acceptance_criteria>
- Real HTTP calls are made to the configured Evolution API instance.
- Success and error states from the API are handled and logged.
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Backend REST API for Notifications</title>
<type>execute</type>
<read_first>
- backend/src/notifications/notifications.module.ts
</read_first>
<action>
1. Generate `NotificationsController` in the backend.
2. Add endpoints to:
   - Get and update `NotificationConfig` for a clinic.
   - Get, create, update, and delete `NotificationTemplate`s.
   - Get a paginated list of `NotificationLog`s with filters (status, channel, date).
   - Trigger a manual retry for a failed notification.
   - Send a test message (connection test).
</action>
<acceptance_criteria>
- All necessary endpoints for the frontend dashboard are exposed and secured.
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Frontend Dashboard: Configurations and Templates</title>
<type>execute</type>
<read_first>
- frontend/src/routes/index.tsx
</read_first>
<action>
1. Create `frontend/src/api/notifications.ts` to consume the new backend endpoints.
2. Build `NotificationsConfig.tsx` page to let clinic admins configure their SMTP credentials and Evolution API connection details. Include a "Test Connection" button.
3. Build a template management interface where users can customize the text for events (Appt Created, 24h Reminder, etc.) and use dynamic placeholders.
4. Add these pages to the frontend routing structure.
</action>
<acceptance_criteria>
- Users can view and save their notification configurations and templates.
- UI handles loading and error states gracefully.
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Frontend Dashboard: Observability and Logs</title>
<type>execute</type>
<read_first>
- frontend/src/pages/super-admin/NotificationsConfig.tsx
</read_first>
<action>
1. Build `NotificationsLogs.tsx` page.
2. Display a paginated data table showing the history of sent and failed notifications.
3. Implement filters for status (`PENDING`, `SENT`, `FAILED`), channel, and search by recipient.
4. Add an action button on failed logs to "Retry" sending the message manually.
</action>
<acceptance_criteria>
- Users can monitor their notification history in real-time.
- Failed messages can be manually retried from the UI.
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Backend successfully communicates with Evolution API when sending a message.
- Frontend properly displays configuration forms and successfully saves data to the backend.
- Notification logs are rendered correctly in the frontend table.
- Manual retry triggers the background job again and updates the log.
</criteria>
</verification>

<must_haves>
- [ ] Evolution API real integration
- [ ] Backend endpoints for configs, templates, and logs
- [ ] React UI for Notification Settings
- [ ] React UI for Logs & Observability
</must_haves>
