---
status: planned
wave: 1
depends_on:
  - 08-ui-ux-premium-refinement
  - 09-light-dark-theme-support
files_modified:
  - backend/src/appointments/dto/create-appointment.dto.ts
  - backend/src/appointments/dto/update-appointment.dto.ts
  - backend/src/appointments/appointments.service.ts
  - frontend/src/lib/api.ts
  - frontend/src/pages/Appointments.tsx
  - frontend/src/components/appointments/*
autonomous: true
---

# Phase 10 Plan: Premium Veterinary Appointment Calendar

## Task 1: Harden Appointment API Contract
- **files:**
  - `backend/src/appointments/dto/create-appointment.dto.ts`
  - `backend/src/appointments/dto/update-appointment.dto.ts`
  - `backend/src/appointments/appointments.service.ts`
- **read_first:**
  - `backend/prisma/schema.prisma`
  - `backend/src/appointments/appointments.controller.ts`
  - `backend/src/appointments/appointments.service.ts`
- **action:**
  - Replace empty appointment DTOs with typed fields for `scheduledAt`, `petId`, `clientId`, `reason`, and `status`.
  - If the Prisma schema still uses `date`, map `scheduledAt` to `date` deliberately in the service instead of spreading raw payloads.
  - Persist `reason` in `AppointmentsService.create`.
  - Include `pet.client` and `client` in appointment responses so the calendar can render patient and tutor context.
  - Keep status values aligned with `AppointmentStatus`: `SCHEDULED`, `COMPLETED`, `CANCELLED`.
- **acceptance_criteria:**
  - Create payloads persist `reason`.
  - Appointment list responses include pet/client display data.
  - Backend TypeScript build succeeds if backend files are changed.

## Task 2: Expand Frontend Appointment Types and Helpers
- **files:**
  - `frontend/src/lib/api.ts`
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/src/components/appointments/*`
- **read_first:**
  - `frontend/src/lib/api.ts`
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/package.json`
- **action:**
  - Update `Appointment` type to match backend-supported statuses and relation data.
  - Prefer `scheduledAt` in frontend appointment types and form state. If backend responses still expose `date`, normalize to `scheduledAt` at the API/page boundary.
  - Use `date-fns` for date keys, week range generation, start/end of day/week, comparisons, and PT-BR labels with `ptBR`.
  - Add `date-fns` to frontend dependencies if it is not already present.
  - Add local calendar helpers for status labels, status colors, and visible appointment filtering.
  - Avoid unsupported `CONFIRMED` handling unless the backend enum is explicitly extended in this phase.
- **acceptance_criteria:**
  - TypeScript does not allow sending unsupported appointment statuses.
  - Calendar calculations use `date-fns`, not hand-rolled `Date` arithmetic.
  - Date and status helper logic is deterministic and locally testable/readable.

## Task 3: Split Appointment Calendar UI Components
- **files:**
  - `frontend/src/components/appointments/AppointmentCalendarControls.tsx`
  - `frontend/src/components/appointments/AppointmentSummaryBar.tsx`
  - `frontend/src/components/appointments/AppointmentDayView.tsx`
  - `frontend/src/components/appointments/AppointmentWeekView.tsx`
  - `frontend/src/components/appointments/AppointmentCard.tsx`
  - `frontend/src/components/appointments/AppointmentFormModal.tsx`
  - `frontend/src/pages/Appointments.tsx`
- **action:**
  - Create focused appointment calendar components for controls, summary, day view, week view, appointment item, and form/status workflow.
  - Keep `Appointments.tsx` responsible for data loading, state orchestration, and page composition only.
  - Avoid adding drag/drop, realtime updates, websocket behavior, or resource scheduling in this phase.
- **acceptance_criteria:**
  - Calendar rendering is split across dedicated components.
  - `Appointments.tsx` remains readable and does not contain all calendar markup and form markup inline.
  - The phase stays operational and simple; no drag/drop or realtime complexity is introduced.

## Task 4: Build Calendar Controls and Summary Bar
- **files:**
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/src/components/appointments/AppointmentCalendarControls.tsx`
  - `frontend/src/components/appointments/AppointmentSummaryBar.tsx`
- **action:**
  - Replace the current list-first page with a calendar-first layout.
  - Add day/week segmented control.
  - Add previous/today/next date navigation.
  - Add status filter and search input.
  - Preserve refresh behavior and premium summary metrics.
- **acceptance_criteria:**
  - Users can switch day/week views without refetching.
  - Date navigation updates visible appointments and summary counts.
  - Filters update the visible calendar immediately.

## Task 5: Implement Day and Week Calendar Views
- **files:**
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/src/components/appointments/AppointmentDayView.tsx`
  - `frontend/src/components/appointments/AppointmentWeekView.tsx`
  - `frontend/src/components/appointments/AppointmentCard.tsx`
- **action:**
  - Implement daily time-slot layout using clinic schedule configuration when available.
  - Avoid hardcoded clinic operating hours as a product assumption; if needed, place fallback hours in a small replaceable helper/constant with an explicit note.
  - Implement weekly overview grouped by day.
  - Use appointment blocks with time, patient, tutor, reason, and status.
  - Provide mobile agenda fallback layout.
  - Keep loading, empty, and error states polished and non-overlapping.
- **acceptance_criteria:**
  - Day view shows appointments under the correct selected date.
  - Week view shows appointments under the correct weekday.
  - Empty days and empty weeks are clear and actionable.

## Task 6: Add Appointment Creation Flow
- **files:**
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/src/components/appointments/AppointmentFormModal.tsx`
- **read_first:**
  - `frontend/src/pages/Clients.tsx`
  - `frontend/src/pages/Pets.tsx`
- **action:**
  - Load pets and clients needed for the form.
  - Add "Nova consulta" modal/form with patient, tutor/client context, scheduled date/time, reason, and status.
  - Store form timestamp as `scheduledAt`; if backend persistence still expects `date`, map only at submit/API boundary.
  - POST to `/appointments` and refresh or locally merge the created appointment.
  - Handle disabled and error states while submitting.
- **acceptance_criteria:**
  - A clinic user can create an appointment from the appointments page.
  - Newly created appointments appear in the correct day/week view.
  - Form errors are visible and do not close the modal prematurely.

## Task 7: Add Status Management
- **files:**
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/src/components/appointments/AppointmentCard.tsx`
- **action:**
  - Add a compact status update control on appointment blocks or in an appointment detail area.
  - PATCH `/appointments/:id` with a backend-supported status.
  - Update local state after success and recover gracefully after failure.
- **acceptance_criteria:**
  - Status updates persist through reload.
  - Status badge color and text update immediately after success.
  - Cancelled/completed appointments remain visible when filters allow them.

## Verification
- Run `npm run build` or `npx tsc -b` in `frontend`.
- If backend files changed, run `npm run build` in `backend`.
- Manually verify:
  - Day navigation.
  - Week navigation.
  - Appointment creation.
  - Status update.
  - Empty and loading states.
  - Light and dark theme readability.

## Must Haves
- Calendar-first `/appointments` experience.
- Daily and weekly views.
- `scheduledAt` used as the appointment timestamp semantic name where practical.
- `date-fns` used for calendar calculations and PT-BR date formatting.
- No hardcoded clinic operating hours as permanent product logic.
- Dedicated appointment calendar components instead of an oversized page file.
- Appointment creation flow.
- Status management using backend-supported statuses.
- Date navigation and filters.
- Premium responsive operational schedule UI for clinic users.
- No drag/drop or realtime complexity in Phase 10.
