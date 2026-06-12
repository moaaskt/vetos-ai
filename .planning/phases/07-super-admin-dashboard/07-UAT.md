---
status: testing
phase: 07-super-admin-dashboard
source: [07-SUMMARY.md]
started: 2026-05-16T18:43:00.000Z
updated: 2026-05-16T18:43:00.000Z
---

## Current Test
number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: [pending]

### 2. Super Admin Navigation
expected: Logging in as a user with the SUPERADMIN role replaces the standard left-hand sidebar navigation with "Platform Stats" and "Manage Clinics".
result: [pending]

### 3. Impersonate Clinic
expected: On the "Manage Clinics" page, clicking "Login as Clinic" on a specific clinic row immediately switches the UI into the perspective of that clinic workspace.
result: [pending]

### 4. Exit Impersonation Banner
expected: While impersonating, a persistent red banner appears at the top reading "Impersonating Clinic (ID: [id])". Clicking "Exit Impersonation" successfully returns the user to the standard Super Admin workspace view.
result: [pending]

### 5. Platform Stats Dashboard
expected: Navigating to the "Platform Stats" page successfully loads high-level metrics cards (Total Clinics, Active Today, Estimated MRR) without any server or fetching errors.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps
