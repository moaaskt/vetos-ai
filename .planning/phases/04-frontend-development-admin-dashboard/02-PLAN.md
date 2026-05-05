---
wave: 2
depends_on: ["01-PLAN.md"]
files_modified:
  - frontend/src/pages/Dashboard.tsx
  - frontend/src/pages/Clients.tsx
  - frontend/src/pages/Pets.tsx
  - frontend/src/pages/Appointments.tsx
autonomous: true
---

# Phase 4 Plan 2: Dashboard and Resource Management

## Goal
Implement the business-critical pages of the VetOS AI dashboard, allowing clinics to view statistics and manage their clients and pets.

## Tasks

<task>
<id>1</id>
<title>Implement Dashboard Overview</title>
<type>execute</type>
<read_first>
- frontend/src/lib/api.ts
</read_first>
<action>
Create `frontend/src/pages/Dashboard.tsx`:
- Fetch statistics from the `/dashboard/stats` endpoint.
- Display premium "Stat Cards" showing Total Clients, Total Pets, and Total Appointments.
- Include a simple "Welcome" banner with the clinic's name.
</action>
<acceptance_criteria>
- Dashboard shows live data from the backend
- Layout is responsive and matches the premium aesthetic
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Implement Clients Management Page</title>
<type>execute</type>
<read_first>
- frontend/src/lib/api.ts
</read_first>
<action>
Create `frontend/src/pages/Clients.tsx`:
- Fetch and display a table of clients.
- Implement a "Add Client" modal/form.
- Support basic Client CRUD (Create, Read).
</action>
<acceptance_criteria>
- Clients list is populated from the API
- "Add Client" successfully persists data to the database
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Implement Pets Management Page</title>
<type>execute</type>
<read_first>
- frontend/src/pages/Clients.tsx
</read_first>
<action>
Create `frontend/src/pages/Pets.tsx`:
- Fetch and display a list of pets.
- Implement a "Add Pet" modal that includes a dropdown to select the owner (Client).
- Display pet details (Species, Breed, Age).
</action>
<acceptance_criteria>
- Pets are correctly linked to their respective owners
- Interface is intuitive for veterinary clinic staff
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Implement Appointments Page (Basic)</title>
<type>execute</type>
<read_first>
- frontend/src/pages/Pets.tsx
</read_first>
<action>
Create `frontend/src/pages/Appointments.tsx`:
- Display a list of upcoming appointments.
- Include Pet Name and Reason for visit in the list.
</action>
<acceptance_criteria>
- Appointments page is accessible via sidebar
- Data is correctly fetched from the backend
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- All management pages are functional and fetch data correctly
- The multi-tenant isolation is visually confirmed (user only sees their clinic's data)
- Navigation is smooth across the entire dashboard
</criteria>
</verification>

<must_haves>
- [x] Dashboard Statistics
- [x] Clients and Pets CRUD lists
</must_haves>
