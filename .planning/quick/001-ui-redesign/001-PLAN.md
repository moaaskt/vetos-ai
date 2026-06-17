---
status: completed
must_haves:
  truths:
    - All existing API calls, auth logic, routes, and data flows remain untouched.
    - Responsive layout on desktop, tablet, and mobile.
  artifacts:
    - Premium collapsible sidebar and topbar in Layout.
    - Enriched Tenant Dashboard with Today Overview, Quick Actions, and Recent Activity.
    - Premium dense tables in Super Admin views.
  key_links:
    - "001-CONTEXT.md": "aligns with layout and theme decisions"
    - "001-RESEARCH.md": "follows technical strategies and styling patterns"
---

# Quick Task 001 Plan: VetOS AI Frontend UI Redesign

## Task 1: Redesign Core Navigation & Shell (`Layout.tsx` and UI utils)
- **files:**
  - `frontend/src/components/ui/button.tsx`
  - `frontend/src/components/Layout.tsx`
- **action:**
  - Export `buttonVariants` from `button.tsx`.
  - Refactor `Layout.tsx` to implement a collapsible desktop sidebar (`w-64` vs `w-20`) with smooth width transitions and tooltips/labels.
  - Implement a polished sticky top navigation bar with breadcrumbs, quick action triggers, notifications icon, and user profile/clinic context.
  - Upgrade the impersonation alert bar to a premium glowing banner.
  - Implement mobile drawer/slide-down navigation.
- **verify:**
  - Verify layout compiles and renders without breaking auth context or navigation links.
- **done:**
  - `Layout.tsx` renders premium SaaS shell with collapsible sidebar and contextual topbar. (Completed)

## Task 2: Overhaul Tenant Admin Views (`Dashboard`, `Appointments`, `Pets`, `Clients`)
- **files:**
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/src/pages/Pets.tsx`
  - `frontend/src/pages/Clients.tsx`
- **action:**
  - In `Dashboard.tsx`: Add richer sections (Today Overview, Quick Actions bar, Recent Activity placeholder, Upcoming Appointments summary). Use layered gradient cards with teal accents.
  - In `Appointments.tsx`: Enhance upcoming schedule with status pills, avatars, and action buttons.
  - In `Pets.tsx` & `Clients.tsx`: Upgrade grid cards and tables with premium headers, borders, hover states, and centered polished modals.
- **verify:**
  - Verify all state variables, `api.get`, and `api.post` calls function exactly as before.
- **done:**
  - Tenant admin pages present a welcoming, spacious, and highly operational veterinary SaaS experience. (Completed)

## Task 3: Elevate Super Admin Views (`SuperAdminDashboard`, `SuperAdminClinics`)
- **files:**
  - `frontend/src/pages/super-admin/SuperAdminDashboard.tsx`
  - `frontend/src/pages/super-admin/SuperAdminClinics.tsx`
- **action:**
  - In `SuperAdminDashboard.tsx`: Create a dense, analytical overview of platform statistics with premium KPI cards and clean layout hierarchy.
  - In `SuperAdminClinics.tsx`: Implement a high-density premium table with clean borders, zebra striping, and polished "Login as Clinic" impersonation buttons.
- **verify:**
  - Verify metrics and impersonation triggers operate flawlessly.
- **done:**
  - Super admin pages feel analytical, dense, and platform-level. (Completed)
