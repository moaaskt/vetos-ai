# Phase 9: Light/Dark Theme Support

## Executive Summary
Implement premium light and dark theme support across the VetOS AI frontend application. The platform currently defaults to a dark theme. This phase introduces a professional, warm light theme as the primary default for clinic and admin users, while retaining a refined, low-contrast dark mode as a user-selectable option. Theme preference must persist via `localStorage` and switch dynamically without page reloads.

## Functional Requirements

### 1. Theme State & Provider
- Implement a `ThemeProvider` or application-level theme state management (e.g. React context).
- Support two explicit modes: `light` and `dark`.
- Default initial state to `light` mode.
- Synchronize active theme with `localStorage` (key: `vetos_theme`).
- Apply corresponding `light` or `dark` class / data-theme attribute to the document root element (`html` / `:root`).

### 2. UI Toggle Control
- Add an accessible theme toggle button in the main navigation topbar (`Layout.tsx` / `PageHeader`).
- Provide clear visual indication of active mode (Sun/Moon icons from Lucide).

### 3. Component & Layout Theming
- Ensure all shared UI primitives (`Button`, `Card`, `Input`, `Dialog`, `Skeleton`, `EmptyState`) correctly adapt to theme tokens.
- Ensure both Tenant Admin (Dashboard, Appointments, Pets, Clients) and Super Admin (Dashboard, Clinics) dashboards render beautifully in both modes.

## Non-Functional Requirements
- **No Business Logic Changes**: All existing API calls, authentication flows, routing, and data models must remain completely untouched.
- **Performance**: Zero flickering on initial page load (ensure root theme class is applied synchronously if possible or correctly initialized in React).
- **Responsive & Accessible**: Maintain responsive layouts and high contrast accessibility standards.
- **Verification**: Must pass `npm run build` and `npm run lint` cleanly.

## Success Criteria
- [ ] Theme toggle present in topbar navigation.
- [ ] User can click toggle to instantly switch between light and dark modes.
- [ ] Theme choice persists across browser refresh via `localStorage`.
- [ ] Light mode features soft warm background, white cards, subtle slate borders, and calm teal accents.
- [ ] Dark mode maintains professional low-contrast dark aesthetics without harsh neon colors.
