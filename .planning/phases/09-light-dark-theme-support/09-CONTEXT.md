# Phase 9: Light/Dark Theme Support

## Domain
Visual identity, theme token architecture, and state persistence for light and dark modes across the frontend application.

## Canonical Refs
- `ROADMAP.md` (Phase 9 definition)
- `09-REQUIREMENTS.md`

## Implementation Decisions

### 1. Theme State Management
- **Decision:** React Context (`ThemeProvider`) persisting to `localStorage` (`vetos_theme`).
- **Details:** Mounts at the root (`App.tsx` or `main.tsx`). Injects `.dark` class onto `document.documentElement` when dark mode is active, or removes it for light mode. Initial state defaults to `light`.

### 2. Design Tokens & Palette
- **Decision:** Utilize CSS variables in `index.css` with a clean `@layer base` division for `:root` (light) and `.dark` (dark).
- **Details:** 
  - **Light Mode:** Premium healthcare SaaS aesthetic. Soft warm background (`oklch(0.98 0.005 240)`), white surfaces (`oklch(1 0 0)`), subtle borders (`oklch(0.90 0.01 240)`), calm teal/emerald accents.
  - **Dark Mode:** Refined, low-contrast dark mode. Deep slate backgrounds (`oklch(0.18 0.012 235)`), layered cards (`oklch(0.22 0.012 230)`). No heavy neon glow or excessive contrast.

### 3. Topbar Toggle
- **Decision:** Integrated directly into the header/navigation bar.
- **Details:** Uses Lucide `Sun` and `Moon` icons inside a button with smooth rotation/scale transitions.

## Codebase Context
- Project uses React 18, Vite, Tailwind CSS (v4 format with `@import "tailwindcss";` in `index.css`), and Lucide icons.
- Current styling in `index.css` directly maps dark mode colors on `:root`. This will be refactored so `:root` holds light mode tokens and `.dark` holds dark mode tokens.

## Deferred Ideas
- Automated system theme detection (`prefers-color-scheme`) is deferred for now to ensure explicit default to `light` mode for all initial clinic users as requested.
