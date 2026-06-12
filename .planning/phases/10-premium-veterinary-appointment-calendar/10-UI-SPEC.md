# Phase 10 UI Spec: Appointment Calendar

## Experience Direction

The appointment calendar is an operational clinic tool. It should feel calm, dense, and fast to scan: more like a dispatch board than a marketing page. Avoid decorative hero sections. Use the existing dashboard shell and place the working calendar directly in the content area.

## Layout

- Header: page title, concise description, primary "Nova consulta" action, and refresh action.
- Control row: day/week segmented control, previous/today/next controls, selected date label, status filter, and search input.
- Summary row: total visible appointments, scheduled, completed, cancelled, and next appointment.
- Main area:
  - Day view: vertical time slots with appointment blocks grouped by hour.
  - Week view: seven columns on desktop; stacked day sections on mobile.
- Detail/create modal: compact form with patient/client selection, date/time, reason, and status.

## Components

- Use Lucide icons for actions: `CalendarDays`, `Plus`, `ChevronLeft`, `ChevronRight`, `Clock`, `Filter`, `Search`, `CheckCircle2`, `XCircle`, `CircleDot`.
- Use existing `Button`, `Card`, `Input`, `Skeleton`, and modal/dialog components.
- Use fixed dimensions for icon buttons and segmented controls so navigation does not shift layout.
- Keep cards to actual repeated items or tool surfaces. Do not nest cards inside cards.

## Visual States

- `SCHEDULED`: amber or primary-muted treatment.
- `COMPLETED`: emerald treatment.
- `CANCELLED`: rose/destructive treatment.
- Loading: skeleton rows matching the calendar structure.
- Empty day/week: use `EmptyState` with an action to create an appointment.
- Error: compact destructive alert above the calendar body.

## Responsiveness

- Desktop: full week grid may use seven columns with horizontal density.
- Tablet: allow tighter columns and shorter appointment content.
- Mobile: convert week view to stacked date sections; controls wrap into two rows if needed.

## Accessibility

- Controls must have accessible names or clear text labels.
- Status update buttons/selects must be keyboard reachable.
- Form validation errors must be visible near the relevant field.
- Color cannot be the only status signal; include text labels.
