# Phase 7: Super Admin Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 07-Super Admin Dashboard
**Areas discussed:** Tenant Isolation & Support Strategy, Global Metrics Aggregation, Plan & Subscription Management

---

## Tenant Isolation & Support Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Login as Clinic | Secure impersonation feature with strict audit logs and UI indicators | ✓ |
| Global Tables Only | View and manage clinic data solely through high-level super admin tables | |

**User's choice:** Secure impersonation feature with strict audit logging, visual indicator, credential masking, and high-level management tables.
**Notes:** User emphasized that impersonation is strictly for support/debugging, credentials must be masked, and every action must be audit logged.

---

## Global Metrics Aggregation

| Option | Description | Selected |
|--------|-------------|----------|
| Real-time | Calculate metrics dynamically on page load | |
| Periodic Background | Pre-calculate via scheduled cron jobs | |
| Hybrid Aggregation | Near real-time for operational stats, scheduled jobs for heavy analytics | ✓ |

**User's choice:** Hybrid aggregation with Redis caching.
**Notes:** Critical operational metrics (active clinics) near real-time; heavy analytics (MRR, growth charts) pre-calculated via scheduled jobs. Dashboard must feel instant.

---

## Plan & Subscription Management

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed Tiers | Predefined SaaS plans (Basic, Pro, Enterprise) | |
| Custom Overrides | Per-clinic customized limits | |
| Fixed Plans + Custom Overrides | Standard tiers with ability for super admins to override limits per clinic | ✓ |

**User's choice:** Both fixed plans and per-clinic custom overrides.
**Notes:** Super admins can override max staff seats, notifications, storage, and feature flags. UI must clearly show when overrides are active.

---

## the agent's Discretion
- UI design token mapping, charting libraries, table filtering/sorting UX components.

## Deferred Ideas
- Automated credit card billing and invoice generation.
