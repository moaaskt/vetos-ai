---
wave: 1
depends_on: []
files_modified:
  - frontend/package.json
  - frontend/src/lib/api.ts
  - frontend/src/context/AuthContext.tsx
  - frontend/src/pages/Login.tsx
  - frontend/src/pages/Register.tsx
  - frontend/src/components/Layout.tsx
  - frontend/src/App.tsx
autonomous: true
---

# Phase 4 Plan 1: Auth and Core Layout

## Goal
Establish the frontend infrastructure including API communication, authentication state, and the main dashboard layout.

## Tasks

<task>
<id>1</id>
<title>Install Frontend Dependencies</title>
<type>execute</type>
<read_first>
- frontend/package.json
</read_first>
<action>
Navigate to `frontend` and install:
`npm install react-router-dom lucide-react axios clsx tailwind-merge`
</action>
<acceptance_criteria>
- `frontend/package.json` contains the new dependencies
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Setup API Client and Auth Context</title>
<type>execute</type>
<read_first>
- frontend/src/main.tsx
</read_first>
<action>
1. Create `frontend/src/lib/api.ts` configured with `baseURL: 'http://localhost:3000'` (default NestJS) and interceptors to attach the JWT token.
2. Create `frontend/src/context/AuthContext.tsx` to manage user state, login, register, and logout. Persist JWT in `localStorage`.
</action>
<acceptance_criteria>
- `AuthContext` provides `user` and `login/logout` methods
- API client automatically adds `Authorization` header if token exists
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Implement Auth Pages</title>
<type>execute</type>
<read_first>
- frontend/src/App.tsx
</read_first>
<action>
1. Create `frontend/src/pages/Login.tsx` with a premium dark-themed form.
2. Create `frontend/src/pages/Register.tsx` with fields for both Clinic Name and Admin User details.
</action>
<acceptance_criteria>
- Login and Register forms are functional and styled with Tailwind
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Implement Main Layout and Routing</title>
<type>execute</type>
<read_first>
- frontend/src/index.css
</read_first>
<action>
1. Create `frontend/src/components/Layout.tsx` featuring a modern sidebar and topbar.
2. Setup `frontend/src/App.tsx` with `BrowserRouter` and routes for `/login`, `/register`, and a protected `/dashboard`.
3. Use `Lucide` icons for sidebar navigation (Home, Users, Dog, Calendar).
</action>
<acceptance_criteria>
- Sidebar navigation works correctly
- Routes are protected (redirect to login if not authenticated)
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Frontend compiles and starts successfully
- User can navigate between Login and Register
- Successful login redirects to Dashboard with the correct layout
</criteria>
</verification>

<must_haves>
- [x] Auth forms (Login/Register)
- [x] Protected Layout with Sidebar
</must_haves>
