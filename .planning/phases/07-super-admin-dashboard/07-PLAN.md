---
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/auth/auth.service.ts
  - backend/src/auth/jwt.strategy.ts
  - backend/src/auth/auth.controller.ts
  - backend/src/scheduler/scheduler.service.ts
  - backend/src/dashboard/dashboard.module.ts
  - backend/src/dashboard/dashboard.service.ts
  - backend/src/dashboard/dashboard.controller.ts
  - frontend/src/App.tsx
  - frontend/src/components/Layout.tsx
  - frontend/src/context/AuthContext.tsx
  - frontend/src/pages/super-admin/SuperAdminDashboard.tsx
  - frontend/src/pages/super-admin/SuperAdminClinics.tsx
autonomous: false
---

# Phase 7: Super Admin Dashboard - Execution Plan

## 1. Database Schema Evolution
<task>
<read_first>
- backend/prisma/schema.prisma
- .planning/phases/07-super-admin-dashboard/07-CONTEXT.md
</read_first>
<action>
Modify `backend/prisma/schema.prisma` to support Super Admin capabilities and Subscription Plans:
1. Update `enum Role`: Add `SUPERADMIN` to the list of roles.
2. Update `model User`: Change `clinicId String` to `clinicId String?` (optional) to allow SUPERADMIN users to exist without a clinic.
3. Add `model ImpersonationLog`:
   ```prisma
   model ImpersonationLog {
     id String @id @default(uuid())
     superAdminId String
     targetClinicId String
     reason String
     startedAt DateTime @default(now())
     superAdmin User @relation(fields: [superAdminId], references: [id])
     targetClinic Clinic @relation(fields: [targetClinicId], references: [id])
   }
   ```
4. Add `model Plan`:
   ```prisma
   model Plan {
     id String @id @default(uuid())
     name String @unique
     maxStaffSeats Int
     maxNotifications Int
     maxStorage Int
     features Json
     subscriptions ClinicSubscription[]
   }
   ```
5. Add `model ClinicSubscription`:
   ```prisma
   model ClinicSubscription {
     id String @id @default(uuid())
     clinicId String @unique
     planId String
     customMaxStaffSeats Int?
     customMaxNotifications Int?
     customMaxStorage Int?
     customFeatures Json?
     clinic Clinic @relation(fields: [clinicId], references: [id])
     plan Plan @relation(fields: [planId], references: [id])
   }
   ```
</action>
<acceptance_criteria>
- `cat backend/prisma/schema.prisma` contains `enum Role { ADMIN STAFF SUPERADMIN }`
- `cat backend/prisma/schema.prisma` contains `clinicId String?` in `model User`
- `cat backend/prisma/schema.prisma` contains `model ImpersonationLog`, `model Plan`, and `model ClinicSubscription`
</acceptance_criteria>
</task>

## 2. [BLOCKING] Schema Push Required
<task>
<read_first>
- backend/prisma/schema.prisma
</read_first>
<action>
This phase modifies schema-relevant files (Prisma ORM). The executor MUST run the database schema push command to apply the new models before any TypeScript code is verified, otherwise build checks will produce false positives.

Run the following command from the `backend` directory:
`npx prisma db push --accept-data-loss`

Since this modifies live schema constraints, flag the task for manual intervention if errors occur.
</action>
<acceptance_criteria>
- Terminal output confirms the schema was successfully synchronized with the database.
- `npx prisma generate` was executed automatically or manually after push.
</acceptance_criteria>
</task>

## 3. Backend Auth & Impersonation Logic
<task type="tdd">
<read_first>
- backend/src/auth/auth.service.ts
- backend/src/auth/jwt.strategy.ts
- backend/src/auth/auth.controller.ts
</read_first>
<action>
Implement the impersonation auth mechanism in the backend:
1. Update `JwtStrategy.validate` in `jwt.strategy.ts` to extract `isImpersonating` from the payload: `isImpersonating: payload.isImpersonating || false`.
2. Add a new DTO `ImpersonateDto` containing `targetClinicId: string` and `reason: string`.
3. In `auth.service.ts`, implement `impersonateClinic(superAdminId: string, dto: ImpersonateDto)`:
   - Verify the requesting user has the `SUPERADMIN` role.
   - Verify the `targetClinicId` exists.
   - Create a record in `ImpersonationLog` using Prisma.
   - Return a new JWT containing `{ sub: superAdminId, role: 'SUPERADMIN', clinicId: targetClinicId, isImpersonating: true }`.
4. Expose `POST /auth/impersonate` in `auth.controller.ts`, guarded by JwtAuthGuard, extracting the user ID from the request.
</action>
<acceptance_criteria>
- `grep "isImpersonating" backend/src/auth/jwt.strategy.ts` returns matches.
- `grep "impersonateClinic" backend/src/auth/auth.service.ts` returns matches.
- `grep "@Post('impersonate')" backend/src/auth/auth.controller.ts` returns matches.
</acceptance_criteria>
</task>

## 4. Backend Global Metrics & Plans API
<task>
<read_first>
- backend/src/scheduler/scheduler.service.ts
- backend/src/dashboard/dashboard.controller.ts
- backend/src/dashboard/dashboard.service.ts
</read_first>
<action>
Implement hybrid global metrics aggregation and plan management API:
1. In `scheduler.service.ts`, add `@Cron(CronExpression.EVERY_HOUR) async handleGlobalMetricsAggregation()`:
   - Query total clinics, total MRR (derived from plans), total appointments.
   - Store the JSON result in Redis via `ioredis` (if available, otherwise basic memory cache temporarily) under the key `global_metrics:cache`.
2. In `dashboard.service.ts`, implement `getSuperAdminMetrics()`:
   - Fetch heavy stats from the Redis `global_metrics:cache` key.
   - Query fast operational stats directly from Prisma (e.g., active clinics today).
   - Merge and return the result.
3. In `dashboard.controller.ts`, add `GET /dashboard/super-admin/metrics` protected by a `SUPERADMIN` role guard.
4. Add basic CRUD endpoints in a new `plans.controller.ts` (or within dashboard) for Super Admins to list clinics and view/update `ClinicSubscription` overrides.
</action>
<acceptance_criteria>
- `grep "handleGlobalMetricsAggregation" backend/src/scheduler/scheduler.service.ts` returns matches.
- `grep "getSuperAdminMetrics" backend/src/dashboard/dashboard.service.ts` returns matches.
- `grep "@Get('super-admin/metrics')" backend/src/dashboard/dashboard.controller.ts` returns matches.
</acceptance_criteria>
</task>

## 5. Frontend Routing & AuthContext Updates
<task>
<read_first>
- frontend/src/App.tsx
- frontend/src/context/AuthContext.tsx
</read_first>
<action>
Update the frontend foundation to support Super Admin roles and impersonation:
1. In `AuthContext.tsx`, update the `User` type to include `isImpersonating?: boolean` (decoded from JWT).
2. Implement an `exitImpersonation` function in `AuthContext` that removes the impersonation token and restores the original SUPERADMIN token (or forces a re-login/token refresh).
3. In `App.tsx`, create a `<SuperAdminRoute />` component that checks `user?.role === 'SUPERADMIN'` and prevents access to non-admins.
4. Add route definitions for `/super-admin/dashboard` and `/super-admin/clinics` nested inside `<SuperAdminRoute />`.
</action>
<acceptance_criteria>
- `grep "isImpersonating" frontend/src/context/AuthContext.tsx` returns matches.
- `grep "exitImpersonation" frontend/src/context/AuthContext.tsx` returns matches.
- `grep "SuperAdminRoute" frontend/src/App.tsx` returns matches.
</acceptance_criteria>
</task>

## 6. Frontend Super Admin UI & Impersonation Banner
<task>
<read_first>
- frontend/src/components/Layout.tsx
- .planning/phases/07-super-admin-dashboard/07-UI-SPEC.md
</read_first>
<action>
Build the Super Admin interfaces applying the exact UI-SPEC guidelines:
1. In `Layout.tsx`, read `isImpersonating` from `useAuth()`. If `true`, render a persistent top banner:
   `<div className="bg-red-500 text-white p-2 text-center text-sm font-medium">Impersonating Clinic (ID: {user.clinicId}) <button onClick={exitImpersonation} className="underline font-bold ml-2">Exit Impersonation</button></div>`
2. Create `frontend/src/pages/super-admin/SuperAdminDashboard.tsx` utilizing standard dashboard cards (`bg-slate-900 border-white/10 text-white`) to display the hybrid metrics (MRR, Total Clinics).
3. Create `frontend/src/pages/super-admin/SuperAdminClinics.tsx` with a table listing all clinics, their active plan, and a "Login as Clinic" (Impersonate) action button colored with the accent `#2dd4bf` (`bg-teal-400`).
4. Implement a "Manage Limits" modal to configure custom overrides (`customMaxStaffSeats`, etc.) for a specific clinic.
</action>
<acceptance_criteria>
- `grep "Impersonating Clinic" frontend/src/components/Layout.tsx` returns matches.
- `cat frontend/src/pages/super-admin/SuperAdminDashboard.tsx` contains metric card elements matching UI-SPEC colors.
- `cat frontend/src/pages/super-admin/SuperAdminClinics.tsx` contains an Impersonate action.
</acceptance_criteria>
</task>

## Verification
- Run `npm run build` in `/backend`. Expect successful compilation.
- Run `npm run build` in `/frontend`. Expect successful compilation.
- Run `npx prisma generate` in `/backend`. Expect successful generation.

## Must Haves
- SUPERADMIN role exists in database schema.
- Schema push is explicitly executed.
- Impersonation logs are recorded in the database.
- Redis-based (or memory-fallback) hybrid metrics aggregation is implemented via cron job.
- Frontend includes an "Exit Impersonation" banner when the state is active.
- UI styling precisely follows `07-UI-SPEC.md` colors (`bg-slate-950`, `bg-teal-400`).
