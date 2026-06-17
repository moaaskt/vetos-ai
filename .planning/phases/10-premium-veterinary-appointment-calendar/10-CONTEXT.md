# Phase 10: Premium Veterinary Appointment Calendar - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a premium operational calendar for clinic users to manage veterinary appointments. The experience must support daily and weekly views, appointment creation, status management, date filters, and an efficient schedule workflow for front-desk and clinical staff.
</domain>

<decisions>
## Implementation Decisions

### Calendar Experience
- **D-01:** The first screen of `/appointments` must become the operational calendar, not a static appointment list.
- **D-02:** Support a segmented day/week view switch with persistent selected date state inside the page.
- **D-03:** The daily view must show time slots across the clinic schedule and make appointments visually scannable by status.
- **D-04:** The weekly view must show seven day columns with appointments grouped by date and compact summaries for clinic scheduling staff.
- **D-05:** The page must preserve the premium UI foundation from Phases 8 and 9: `Card`, `Button`, `Input`, `Dialog`/`Modal`, theme tokens, Lucide icons, responsive behavior, loading states, and empty states.
- **D-06:** Use `date-fns` for calendar calculations, date range derivation, and PT-BR formatting via the `ptBR` locale. Avoid hand-rolled date math.
- **D-07:** Split calendar UI into dedicated components instead of growing `Appointments.tsx` into an oversized page file.

### Appointment Workflow
- **D-08:** Appointment creation must happen from the calendar page using existing clinic data: clients, pets, scheduled date/time, reason, and initial status.
- **D-09:** Use `scheduledAt` as the frontend/API semantic name for the appointment timestamp wherever practical, instead of introducing separate date-only handling. If the Prisma field remains `date` for compatibility, map it at the API boundary deliberately.
- **D-10:** Status management must be available from the appointment item/detail workflow using the existing status enum: `SCHEDULED`, `COMPLETED`, `CANCELLED`.
- **D-11:** If a confirmed visual state is needed in the UI, it must either map to an existing backend-supported status or the phase must explicitly extend the backend enum and API contract. Do not silently send unsupported statuses.
- **D-12:** Appointment filtering must include selected date, date range implied by view mode, status, and text search across pet/client/reason when local data is loaded.

### Backend/API Scope
- **D-13:** Use existing appointment endpoints as the base: `GET /appointments`, `POST /appointments`, `PATCH /appointments/:id`, and existing tenant scoping.
- **D-14:** Add DTO validation and safer service behavior where needed before depending on frontend calendar writes.
- **D-15:** Prefer backend date-range filtering if implementation cost is low; otherwise load appointments and filter locally for Phase 10 while preserving a clean future API path.

### Operational Constraints
- **D-16:** The calendar must work for clinics with no appointments, many appointments in one day, and appointments outside business hours.
- **D-17:** Do not hardcode clinic operating hours as a permanent product assumption. Derive visible hours from clinic schedule configuration when available, otherwise use a clearly isolated fallback constant that can be replaced later.
- **D-18:** Mobile must degrade to a practical agenda layout rather than forcing a cramped desktop grid.
- **D-19:** Time labels, appointment dates, and form copy should remain PT-BR aligned with the rest of the app.
- **D-20:** Keep the calendar operational and simple in this phase. Do not add drag/drop rescheduling, realtime updates, websocket behavior, or complex resource scheduling.
</decisions>

<canonical_refs>
## Canonical References

Downstream agents MUST read these before planning or implementing:

- `.planning/ROADMAP.md` - Phase 10 goal and roadmap context.
- `.planning/STATE.md` - Active project state.
- `.planning/phases/08-ui-ux-premium-refinement/08-UI-SPEC.md` - Existing premium UI conventions.
- `.planning/phases/09-light-dark-theme-support/09-UI-SPEC.md` - Light/dark token behavior.
- `frontend/src/pages/Appointments.tsx` - Current appointment page to replace/refactor.
- `frontend/src/lib/api.ts` - Current frontend API types.
- `backend/src/appointments/appointments.controller.ts` - Appointment API routes.
- `backend/src/appointments/appointments.service.ts` - Appointment persistence behavior.
- `backend/prisma/schema.prisma` - Appointment model and status enum.
</canonical_refs>

<code_context>
## Existing Code Insights

### Frontend
- `frontend/src/pages/Appointments.tsx` currently renders a premium list of appointments with summary cards, refresh, status badges, loading skeletons, and an empty state.
- `frontend/src/pages/Clients.tsx` and `frontend/src/pages/Pets.tsx` already contain modal-based creation flows that can guide the appointment creation form.
- `frontend/src/lib/api.ts` defines `Appointment`, `Client`, and `Pet` types, but `Appointment.status` currently omits any `CONFIRMED` value despite the page checking for it visually.
- `frontend/src/components/ui/*` provides reusable `Button`, `Card`, `Input`, `Dialog`, and `Skeleton` primitives.
- Calendar implementation should create dedicated components under `frontend/src/components/appointments/` or a similarly scoped folder for controls, day view, week view, appointment item, summary, and creation/status workflows.

### Backend
- `backend/src/appointments/appointments.controller.ts` exposes tenant-scoped CRUD behind `JwtAuthGuard`.
- `backend/src/appointments/appointments.service.ts` currently accepts `any` payloads, creates `date`, `status`, `petId`, `clientId`, and `clinicId`, and includes only `pet` on create/find responses.
- `backend/prisma/schema.prisma` has `AppointmentStatus` values: `SCHEDULED`, `COMPLETED`, `CANCELLED`.
- Appointment `reason` exists in the schema but is not currently persisted in the service create path.
- Prisma currently names the timestamp field `date`; Phase 10 should prefer `scheduledAt` in DTOs/types where possible and map to `date` intentionally if schema renaming is deferred.

### Integration Points
- Calendar creation needs clients and pets from `/clients` and `/pets`.
- Appointment cards need pet and owner context, so backend includes should return `pet.client` or the frontend must join from loaded client/pet data.
</code_context>

<deferred>
## Deferred Ideas

- Drag-and-drop rescheduling.
- Multi-veterinarian resource columns.
- Recurring appointments.
- External calendar sync.
- Real-time websocket updates.
</deferred>

---

*Phase: 10-Premium Veterinary Appointment Calendar*
*Context gathered: 2026-05-18*
