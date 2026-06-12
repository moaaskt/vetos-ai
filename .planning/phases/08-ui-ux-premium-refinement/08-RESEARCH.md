# Phase 8: UI/UX premium refinement for tenant admin and super admin dashboards

## Overview
This phase refines the visual and experiential aspects of VetOS AI. We are adopting a hybrid `shadcn/ui` + Tailwind approach to deliver a premium, accessible, and consistent user interface without adding new functional scope.

## Technical Findings
- The frontend is using React 19, Tailwind CSS v4, and Vite.
- Basic utilities like `clsx` and `tailwind-merge` are installed, but `class-variance-authority` and Radix primitives (`@radix-ui/react-*`) are missing.
- Existing pages (`Dashboard.tsx`, `Appointments.tsx`, `Clients.tsx`, `Pets.tsx`, `SuperAdminDashboard.tsx`, `SuperAdminClinics.tsx`) use raw Tailwind classes with custom HTML structures.
- A custom `Modal.tsx` exists and needs to be replaced or wrapped using `shadcn/ui` Dialog primitives for accessibility and smooth transitions.
- There is currently no reusable `EmptyState` or `Skeleton` component.

## Required Implementations

1. **Foundation (shadcn/ui & Tokens)**
   - Initialize `components.json` (or just manually set up the `lib/utils.ts` `cn` helper and install dependencies if standard CLI `npx shadcn-ui@latest init` isn't preferred for manual integration).
   - Install required dependencies: `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`.
   - Update `index.css` to define the global CSS variables and color palettes required by shadcn (`slate-950` backgrounds, `teal-400` primary accents).

2. **Core Components**
   - Import/create core UI components: `Button`, `Card`, `Input`, `Dialog`, `Skeleton`.
   - Create a custom `EmptyState` component featuring SVG placeholders and standard copy layouts.
   - Introduce subtle micro-interactions across these components (hover states, focus rings, shadows).

3. **Refactoring Pages**
   - Wrap existing page content in the new `Card` and `Button` components.
   - Add `Skeleton` loaders for all data fetching states (currently likely using raw `<div>Loading...</div>` or similar).
   - Implement the `EmptyState` component where lists (appointments, pets, clinics) are empty.
   - Differentiate Tenant and Super Admin experiences: Tenant pages use warmer, operation-focused spacing and icons; Super Admin uses denser, analytical data-heavy layouts.

## Validation Architecture
- **Verification Strategy:** Visual inspection and code review of components. Check for the presence of `cn()` usage, `shadcn` components in imports, and removal of raw HTML modals.
- **Tools Needed:** Eslint/TypeScript compilation checks to ensure no regressions in typing.

---
*Research complete. Ready for planning.*
