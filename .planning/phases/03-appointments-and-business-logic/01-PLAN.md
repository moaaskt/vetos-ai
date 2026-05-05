---
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/appointments/appointments.module.ts
  - backend/src/appointments/appointments.service.ts
  - backend/src/appointments/appointments.controller.ts
  - backend/src/dashboard/dashboard.module.ts
  - backend/src/dashboard/dashboard.service.ts
  - backend/src/dashboard/dashboard.controller.ts
autonomous: true
---

# Phase 3 Plan 1: Appointments and Dashboard Stats

## Goal
Implement the core appointment management system and a dashboard for high-level clinic statistics, all strictly scoped to the authenticated clinic.

## Tasks

<task>
<id>1</id>
<title>Update Prisma Schema with Appointments</title>
<type>execute</type>
<read_first>
- backend/prisma/schema.prisma
</read_first>
<action>
Update `backend/prisma/schema.prisma` with:
1. `AppointmentStatus` enum: `SCHEDULED`, `COMPLETED`, `CANCELLED`.
2. `Appointment` model:
   - `id`: UUID (Primary Key)
   - `date`: DateTime
   - `reason`: String?
   - `status`: AppointmentStatus (default SCHEDULED)
   - `petId`: String (Relation to Pet)
   - `clinicId`: String (Relation to Clinic, non-nullable)
   - `createdAt`, `updatedAt`
3. Update `Clinic` model to include `appointments Appointment[]`.
4. Update `Pet` model to include `appointments Appointment[]`.
</action>
<acceptance_criteria>
- `backend/prisma/schema.prisma` contains `model Appointment` and `enum AppointmentStatus`
- Relational integrity is maintained with `clinicId` and `petId`
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>[BLOCKING] Schema Push Required</title>
<type>execute</type>
<read_first>
- backend/prisma/schema.prisma
</read_first>
<action>
Run `npx prisma db push --accept-data-loss` in the `backend` directory to apply the new Appointment model to the local PostgreSQL database, then run `npx prisma generate`.
</action>
<acceptance_criteria>
- `npx prisma db push` executes successfully
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Implement Appointments Module</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
- backend/src/auth/current-user.decorator.ts
</read_first>
<action>
1. Run `npx @nestjs/cli g res appointments --no-spec` in the `backend`. Select REST API.
2. In `AppointmentsController`, protect all routes with `@UseGuards(JwtAuthGuard)`.
3. In `AppointmentsService`, implement CRUD operations strictly scoped to the authenticated `clinicId`.
</action>
<acceptance_criteria>
- `backend/src/appointments/appointments.controller.ts` exists and uses `@UseGuards(JwtAuthGuard)`
- `backend/src/appointments/appointments.service.ts` filters all queries by `clinicId`
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Implement Dashboard Statistics</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
</read_first>
<action>
1. Generate Dashboard module, service, and controller: `npx @nestjs/cli g module dashboard`, `npx @nestjs/cli g service dashboard`, `npx @nestjs/cli g controller dashboard`.
2. In `DashboardController`, create a `@Get('stats')` endpoint protected by `JwtAuthGuard`.
3. In `DashboardService`, implement a `getStats(clinicId: string)` method that returns:
   - `totalClients`: count of clients in the clinic
   - `totalPets`: count of pets in the clinic
   - `totalAppointments`: count of appointments in the clinic
</action>
<acceptance_criteria>
- `backend/src/dashboard/dashboard.controller.ts` has `@Get('stats')`
- `DashboardService` correctly aggregates counts per `clinicId`
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Prisma schema reflects Appointment entity
- Appointments API respects tenant isolation
- Dashboard API returns correct counts for the clinic
</criteria>
</verification>

<must_haves>
- [x] Appointments Module (scoped to Clinic)
- [x] Appointment status management
- [x] Dashboard statistics
</must_haves>
