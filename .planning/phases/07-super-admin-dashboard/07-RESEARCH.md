# Phase 7: Super Admin Dashboard - Research

## 1. Tenant Isolation & Impersonation Strategy
- **Current Auth Architecture:** NestJS `JwtStrategy` uses a token payload containing `sub`, `email`, `role`, and `clinicId`. The Prisma `User` model currently enforces `clinicId` as a required string.
- **Role Updates:** The `Role` enum in `schema.prisma` lacks a `SUPERADMIN` value. This must be added.
- **Schema Modification:** `clinicId` on the `User` model should become optional (`String?`) to allow super admins to exist without belonging to a specific clinic.
- **Impersonation Logs:** A new Prisma model `ImpersonationLog` is required to track `superAdminId`, `targetClinicId`, `reason`, and `startedAt`.
- **Token Handling:** The auth service needs an endpoint (e.g., `POST /auth/impersonate/:clinicId`) that issues a new JWT for the super admin, injecting the target `clinicId` and an `isImpersonating: true` flag.

## 2. Global Metrics Aggregation
- **Scheduler Infrastructure:** The backend already uses `@nestjs/schedule` (see `scheduler.service.ts`) for cron jobs.
- **Redis Integration:** `ioredis` is installed and used by `BullModule` in `app.module.ts`. We can leverage `ioredis` directly to cache aggregated global metrics.
- **Hybrid Approach:**
  - Fast-moving metrics (e.g., system health, active clinics today) can be queried live.
  - Heavy analytics (MRR, 30-day appointment trends) should be calculated by a new Cron job in `scheduler.service.ts` (e.g., `@Cron(CronExpression.EVERY_HOUR)`) and stored in Redis under a `global_metrics:cache` key.

## 3. Plan & Subscription Management
- **Missing Models:** `schema.prisma` currently lacks any billing or plan tables.
- **Required Schema Additions:**
  - `Plan`: `id`, `name` (Basic, Pro, Enterprise), default limits (`maxStaffSeats`, `maxNotifications`, `maxStorage`).
  - `ClinicSubscription`: Links `Clinic` to `Plan`, containing nullable override fields (`customMaxStaffSeats`, `customMaxNotifications`, etc.) to support per-clinic customization.
- **API Endpoints:** A new `SuperAdminController` is needed to handle CRUD operations for plans and to update clinic subscription overrides.

## 4. Frontend Implementation
- **Routing:** A new route group for `/super-admin` is needed in `frontend/src/App.tsx`, protected by a `SuperAdminRoute` component that checks `user.role === 'SUPERADMIN'`.
- **Impersonation UI:** `AuthContext` must expose the `isImpersonating` state. `Layout.tsx` should conditionally render a persistent banner ("Impersonating Clinic X - Exit") when this state is true.
- **Design:** The `07-UI-SPEC.md` provides the visual contract (Tailwind classes, Lucide icons, dark mode color palette) which should be used to build the new Super Admin dashboard views.
