# Phase 9: Light/Dark Theme Support — Technical Research

## Standard Stack
- **Frontend Framework:** React 18 with TypeScript and Vite.
- **Styling:** Tailwind CSS (v4) with CSS variables defined in `src/index.css`.
- **Icons:** `lucide-react`.
- **Persistence:** Browser `localStorage`.

## Architecture Patterns
- **Theme Provider:** Standard React Context provider pattern (`AuthContext` is already implemented in `src/context/AuthContext.tsx`; we will follow a similar clean pattern for `src/context/ThemeContext.tsx`).
- **CSS Variable Structure:** Tailwind v4 in `index.css` uses `@custom-variant dark (&:is(.dark *));`. We will structure `@layer base` to have `:root` define light mode tokens and `:root.dark` or `.dark` define dark mode tokens.

## Investigation Findings
1. `src/index.css` currently sets dark mode colors on `:root` directly (e.g., `--background: oklch(0.18 ...)`).
2. To default to light mode, `:root` must be updated with light mode tokens (e.g. `--background: oklch(0.98 ...)`).
3. The `.dark` selector will override those variables with the deep slate palette when the `.dark` class is attached to `<html className="dark">`.
4. Shared components (`Button`, `Card`, `Input`, `Dialog`, `Skeleton`, `EmptyState`) use semantic classes (`bg-card`, `text-card-foreground`, `border-border`, `bg-background`, `text-foreground`). By switching the CSS variables at the root level, all components will automatically adapt without requiring component-by-component class rewriting.
