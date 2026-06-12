---
wave: 1
depends_on: []
files_modified:
  - frontend/package.json
  - frontend/src/index.css
  - frontend/src/lib/utils.ts
  - frontend/src/components/ui/button.tsx
  - frontend/src/components/ui/card.tsx
  - frontend/src/components/ui/input.tsx
  - frontend/src/components/ui/dialog.tsx
  - frontend/src/components/ui/skeleton.tsx
  - frontend/src/components/EmptyState.tsx
  - frontend/src/components/Layout.tsx
  - frontend/src/components/PageHeader.tsx
  - frontend/src/components/Modal.tsx
  - frontend/src/pages/Dashboard.tsx
  - frontend/src/pages/Appointments.tsx
  - frontend/src/pages/Clients.tsx
  - frontend/src/pages/Pets.tsx
  - frontend/src/pages/super-admin/SuperAdminDashboard.tsx
  - frontend/src/pages/super-admin/SuperAdminClinics.tsx
autonomous: true
---

# Phase 8: UI/UX Premium Refinement (Wave 1)

## Goal
Implement a premium, accessible UI using a hybrid `shadcn/ui` + Tailwind approach with custom veterinary empty states and subtle micro-interactions across the tenant and super admin dashboards.

## Tasks

```xml
<task id="ui-foundation">
  <title>Setup shadcn/ui foundation and global tokens</title>
  <type>execute</type>
  <description>Install necessary Radix UI primitives and utilities, configure `lib/utils.ts` for class merging, and set up the global CSS variables in `index.css` matching the UI-SPEC colors (`slate-950` backgrounds, `teal-400` primary).</description>
  <read_first>
    - frontend/package.json
    - frontend/src/index.css
    - frontend/src/lib/utils.ts
    - .planning/phases/08-ui-ux-premium-refinement/08-UI-SPEC.md
  </read_first>
  <action>
    Install dependencies: `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `lucide-react` (if missing).
    Create `frontend/src/lib/utils.ts` exporting `cn` using `clsx` and `twMerge`.
    Update `frontend/src/index.css` to add CSS variables for standard shadcn colors mapped to `slate-950` and `teal-400` where applicable (e.g., `--background`, `--primary`, `--muted`).
  </action>
  <acceptance_criteria>
    - `frontend/package.json` contains `class-variance-authority` and `@radix-ui/react-slot`.
    - `frontend/src/lib/utils.ts` exports `function cn(...inputs: ClassValue[])`.
    - `frontend/src/index.css` has `:root` variables defining color themes.
  </acceptance_criteria>
  <requirements>
    - Ensure styling foundations match the UI-SPEC before proceeding.
  </requirements>
</task>

<task id="ui-components">
  <title>Create core UI components (Button, Card, Input, Dialog, Skeleton)</title>
  <type>execute</type>
  <description>Implement the base reusable components aligned with `shadcn/ui` patterns, adding the subtle micro-interactions (hover states, focus rings, skeleton pulsing) defined in the UI-SPEC.</description>
  <read_first>
    - frontend/src/lib/utils.ts
    - .planning/phases/08-ui-ux-premium-refinement/08-UI-SPEC.md
  </read_first>
  <action>
    Create `frontend/src/components/ui/button.tsx` using `cva` for variants (`default`, `outline`, `ghost`, `destructive`). Add `focus-visible:ring-2 focus-visible:ring-teal-400`.
    Create `frontend/src/components/ui/card.tsx` with `Card`, `CardHeader`, `CardTitle`, `CardContent`. Add `hover:shadow-lg transition-shadow` to the main Card container.
    Create `frontend/src/components/ui/input.tsx` with standard styling and `focus-visible:ring-teal-400`.
    Create `frontend/src/components/ui/dialog.tsx` wrapping `@radix-ui/react-dialog` with animated Overlay and Content (`data-[state=open]:animate-in data-[state=closed]:animate-out fade-in-0 zoom-in-95 duration-200`).
    Create `frontend/src/components/ui/skeleton.tsx` with `animate-pulse bg-slate-800 rounded-md`.
    Replace existing `Modal.tsx` entirely with the new `Dialog` component, or wrap it using the `Dialog` primitives to ensure backward compatibility across the app.
  </action>
  <acceptance_criteria>
    - `frontend/src/components/ui/button.tsx` exists and uses `cva`.
    - `frontend/src/components/ui/dialog.tsx` imports from `@radix-ui/react-dialog` and includes `data-[state=open]:animate-in`.
    - `frontend/src/components/ui/skeleton.tsx` exists with `animate-pulse`.
  </acceptance_criteria>
  <requirements>
    - Core primitives must be accessible and include the defined focus/hover states.
  </requirements>
</task>

<task id="empty-state">
  <title>Create custom EmptyState component</title>
  <type>execute</type>
  <description>Implement a reusable `EmptyState` component for displaying zero-data situations with a veterinary-themed SVG placeholder, heading, friendly description, and a primary call to action.</description>
  <read_first>
    - frontend/src/components/ui/button.tsx
  </read_first>
  <action>
    Create `frontend/src/components/EmptyState.tsx`.
    Props should include `title` (string), `description` (string), `icon` (ReactNode), `actionLabel` (optional string), `onAction` (optional function).
    Structure: A centered flex column with a muted background (or simple padding), rendering the icon large, the title in `text-lg font-semibold`, description in `text-slate-400`, and a Button for the action.
    Use `Lucide` icons or inline clean SVGs for the visual element if custom illustrations aren't available as assets yet.
  </action>
  <acceptance_criteria>
    - `frontend/src/components/EmptyState.tsx` exists and exports the component.
    - It accepts `title`, `description`, and `actionLabel` props.
  </acceptance_criteria>
  <requirements>
    - Must provide friendly and humanized feedback per UI-SPEC.
  </requirements>
</task>

<task id="refactor-tenant-pages">
  <title>Refine Tenant Pages (Dashboard, Appointments, Pets, Clients)</title>
  <type>execute</type>
  <description>Refactor the tenant pages to use the new `Card`, `Button`, `Dialog`, `Skeleton`, and `EmptyState` components. Ensure the layout feels welcoming and operational.</description>
  <read_first>
    - frontend/src/pages/Dashboard.tsx
    - frontend/src/pages/Appointments.tsx
    - frontend/src/pages/Pets.tsx
    - frontend/src/pages/Clients.tsx
    - frontend/src/components/ui/card.tsx
    - frontend/src/components/EmptyState.tsx
  </read_first>
  <action>
    In `Dashboard.tsx`, wrap metrics in `Card` components.
    In `Appointments.tsx`, `Pets.tsx`, and `Clients.tsx`, replace raw table/list markup wrappers with `Card` and `CardContent`.
    Add conditional rendering for loading states using `<Skeleton className="h-12 w-full mb-2" />` loops.
    Add `<EmptyState>` when arrays are empty (e.g., `appointments.length === 0`).
    Update existing buttons to use the new `<Button>` component.
    Ensure any modals use the new accessible `Dialog` primitives (via the refactored `Modal.tsx` wrapper).
  </action>
  <acceptance_criteria>
    - `frontend/src/pages/Appointments.tsx` imports `<EmptyState>` and uses it.
    - `frontend/src/pages/Dashboard.tsx` imports `<Card>`.
    - Loading states in at least two pages use `<Skeleton>`.
  </acceptance_criteria>
  <requirements>
    - Replace raw HTML structures with structured UI components.
  </requirements>
</task>

<task id="refactor-super-admin-pages">
  <title>Refine Super Admin Pages</title>
  <type>execute</type>
  <description>Refactor the super admin pages (`SuperAdminDashboard` and `SuperAdminClinics`) to use the new UI primitives, emphasizing an analytical, denser layout.</description>
  <read_first>
    - frontend/src/pages/super-admin/SuperAdminDashboard.tsx
    - frontend/src/pages/super-admin/SuperAdminClinics.tsx
    - frontend/src/components/ui/card.tsx
  </read_first>
  <action>
    In `SuperAdminDashboard.tsx`, wrap the platform stats in `Card` components. Use a dense grid layout.
    In `SuperAdminClinics.tsx`, refactor the clinic list into a structured table inside a `Card`. Use `Button variant="outline"` for the "Login as Clinic" action.
    Add loading `Skeleton` states while fetching global metrics.
    Apply subtle micro-interactions to the clinic rows (e.g., `hover:bg-slate-900 transition-colors`).
  </action>
  <acceptance_criteria>
    - `SuperAdminDashboard.tsx` uses `<Card>` for metrics.
    - `SuperAdminClinics.tsx` implements `<Skeleton>` during data fetch and uses `<Button>` for impersonation.
  </acceptance_criteria>
  <requirements>
    - Differentiate visual density from tenant pages, keeping it analytical.
  </requirements>
</task>
```

## Verification
- Verify `shadcn/ui` foundation: `frontend/src/components/ui/button.tsx` and `card.tsx` exist and use `cn()`.
- Verify pages import `Card`, `Button`, and `EmptyState`.
- Confirm visual changes map to the design contract (subtle hover shadows on Cards, pulse animations on skeletons).

## Must Haves
- `lib/utils.ts` provides `cn()`.
- `Card`, `Button`, `Input`, `Dialog`, `Skeleton` components.
- `EmptyState` component.
- Refactored `Dashboard.tsx`, `Appointments.tsx`, `SuperAdminClinics.tsx`.
