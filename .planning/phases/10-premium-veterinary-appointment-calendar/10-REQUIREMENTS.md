# Phase 10 Requirements: Premium Veterinary Appointment Calendar

## Goal

Deliver a premium veterinary appointment calendar for clinic users with daily and weekly views, appointment creation, status management, date filters, and a practical operational schedule experience.

## Functional Requirements

1. The appointments route must provide a calendar-first interface with a visible current date and day/week view control.
2. Users must be able to move to previous/next day or week and jump back to today.
3. Users must be able to filter appointments by status and search by patient, tutor, or appointment reason.
4. Users must be able to create an appointment from the calendar using patient/client data, date, time, reason, and status.
5. Users must be able to update appointment status without leaving the calendar.
6. The daily view must show appointments positioned or grouped by time.
7. The weekly view must show a seven-day operational overview with compact appointment entries.
8. Empty, loading, and error states must be handled without breaking the calendar layout.
9. The implementation must remain tenant-scoped through existing authenticated APIs.

## Data Requirements

- Appointment fields required in the UI: `id`, `date`, `reason`, `status`, `petId`, `clientId`, `pet`, and tutor/client context.
- Status values must match the backend contract unless the backend enum is intentionally extended.
- Creation must persist `reason`; if the backend currently drops it, fix the service.
- Backend responses should include enough relation data for the UI to render patient and tutor labels reliably.

## UX Requirements

- Calendar controls must be compact, scannable, and consistent with the premium dashboard UI.
- Mobile should use an agenda-style stacked layout for each selected day/week, not a squeezed grid.
- Status colors must be distinct in both light and dark themes.
- Long patient names, tutor names, and reasons must truncate or wrap cleanly without overlapping controls.
- Appointment creation and status updates must show disabled/submitting states and recover gracefully from errors.

## Acceptance Criteria

- `/appointments` renders day and week views from the same appointment dataset.
- Creating an appointment refreshes or inserts it into the visible calendar.
- Updating status changes the visible badge and persists through the API.
- Date navigation and filters produce correct visible appointment counts.
- `npm run build` or `tsc -b` succeeds in `frontend`.
- Relevant backend build/tests pass if appointment service/controller files are changed.
