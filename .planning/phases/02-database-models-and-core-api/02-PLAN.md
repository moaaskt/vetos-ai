---
wave: 2
depends_on: ["01-PLAN.md"]
files_modified:
  - backend/src/clients/clients.module.ts
  - backend/src/clients/clients.service.ts
  - backend/src/clients/clients.controller.ts
  - backend/src/pets/pets.module.ts
  - backend/src/pets/pets.service.ts
  - backend/src/pets/pets.controller.ts
  - backend/src/auth/current-user.decorator.ts
autonomous: true
---

# Phase 2 Plan 2: Client and Pet Modules (Tenant-Scoped)

## Goal
Implement the Client and Pet modules ensuring all operations (Create, Read, Update, Delete) are strictly scoped to the `clinicId` extracted from the authenticated user's JWT. No orphan records or cross-clinic data access should be possible.

## Tasks

<task>
<id>1</id>
<title>Current User Decorator</title>
<type>execute</type>
<read_first>
- backend/src/auth/jwt.strategy.ts
</read_first>
<action>
Create a custom decorator `backend/src/auth/current-user.decorator.ts` that extracts the decoded JWT payload (which contains `userId`, `clinicId`, and `role`) from the request object. This will be used in controllers to scope database queries.
</action>
<acceptance_criteria>
- `backend/src/auth/current-user.decorator.ts` exists and uses `createParamDecorator`
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Tenant-Scoped Clients Module</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
- backend/src/auth/current-user.decorator.ts
</read_first>
<action>
1. Run `npx @nestjs/cli g res clients --no-spec` in the `backend`. Select REST API.
2. In `ClientsController`, protect all routes with `@UseGuards(JwtAuthGuard)`.
3. Inject the `@CurrentUser` decorator into all endpoints.
4. In `ClientsService`, ensure every query (`create`, `findAll`, `findOne`, `update`, `remove`) uses the `clinicId` provided by the controller to restrict data access.
</action>
<acceptance_criteria>
- `backend/src/clients/clients.controller.ts` uses `@UseGuards`
- `backend/src/clients/clients.service.ts` queries include `where: { clinicId: ... }`
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Tenant-Scoped Pets Module</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
- backend/src/auth/current-user.decorator.ts
</read_first>
<action>
1. Run `npx @nestjs/cli g res pets --no-spec` in the `backend`. Select REST API.
2. In `PetsController`, protect all routes with `@UseGuards(JwtAuthGuard)`.
3. Inject the `@CurrentUser` decorator into all endpoints.
4. In `PetsService`, ensure every query restricts data using `clinicId`. When creating a Pet, automatically associate it with the authenticated user's `clinicId`.
</action>
<acceptance_criteria>
- `backend/src/pets/pets.controller.ts` uses `@UseGuards`
- `backend/src/pets/pets.service.ts` queries include `where: { clinicId: ... }`
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Custom decorator successfully extracts `clinicId` from requests
- Client and Pet controllers require authentication
- Service layers strictly enforce `clinicId` filters, preventing cross-tenant data leaks
</criteria>
</verification>

<must_haves>
- [x] No orphan records allowed (Clients and Pets are linked to Clinics)
- [x] Relational integrity maintained across modules
</must_haves>
