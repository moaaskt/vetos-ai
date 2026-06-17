# Phase 7: Super Admin Dashboard - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a centralized Super Admin platform dashboard for managing clinics, plans, tenants, global metrics, and support operations.
</domain>

<decisions>
## Implementation Decisions

### Tenant Isolation & Support Strategy
- **D-01:** Super admins must have a secure "Login as Clinic" (impersonation) feature for support and troubleshooting.
- **D-02:** Strict audit logging is required: every impersonation action must be logged with timestamp, super admin user, target clinic, and reason.
- **D-03:** The UI must clearly indicate when impersonation mode is active.
- **D-04:** Super admins must never see raw passwords or sensitive auth credentials during impersonation.
- **D-05:** High-level global management tables must be provided for clinics, plans, metrics, and operational status.

### Global Metrics Aggregation
- **D-06:** Use a hybrid aggregation model to ensure lightning-fast dashboard performance.
- **D-07:** Critical operational metrics (active clinics, recent appointments, system health) must be calculated in near real-time.
- **D-08:** Heavy analytics and financial metrics (MRR, growth charts, appointment trends, long-range statistics) must be pre-calculated using scheduled background jobs (e.g., hourly/nightly).
- **D-09:** Utilize Redis caching extensively to maintain instant load times even with many clinics.

### Plan & Subscription Management
- **D-10:** Support both default SaaS plans (Basic, Pro, Enterprise) and per-clinic custom overrides.
- **D-11:** Super admins can customize specific limits per clinic: max staff seats, monthly notifications, storage limits, appointment quotas, and feature flags.
- **D-12:** The UI must clearly highlight when a clinic is using custom overrides instead of default plan values.
- **D-13:** Ensure architecture is modular and ready for future billing/payment gateway integrations.

### the agent's Discretion
- UI design token mapping, specific charting libraries (e.g. Recharts/Chart.js), and exact table filtering/sorting UX components.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications
- `ROADMAP.md` § Phase 7 — Core roadmap goals and feature scope.
- `.planning/STATE.md` — Active project state and accumulated context.

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/src/prisma/` — Prisma ORM schema and client for multi-tenant models and audit logs.
- `backend/src/auth/` — JWT authentication module to extend with impersonation tokens.
- `backend/src/scheduler/` — BullMQ/Cron infrastructure for scheduled metrics aggregation.
- `frontend/src/components/` — Premium React/Tailwind UI components to reuse for Super Admin tables, modals, and metric cards.

### Established Patterns
- Multi-tenant architecture with Clinic as root entity.
- Role-based access control (RBAC) separating Super Admin, Clinic Admin, and Staff.

### Integration Points
- Super Admin dashboard routes in frontend (`/super-admin/*`).
- Global metrics aggregation queue and Redis caching layer.
</code_context>

<specifics>
## Specific Ideas
- Visual banner in the header showing "Impersonating [Clinic Name] (Exit)" when impersonation mode is active.
- Instant Redis-backed metric tiles for MRR and active clinics.
</specifics>

<deferred>
## Deferred Ideas
- Automated credit card billing and invoice generation (future billing phase).
</deferred>

---

*Phase: 07-Super Admin Dashboard*
*Context gathered: 2026-05-15*
