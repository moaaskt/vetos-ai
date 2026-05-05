---
wave: 2
depends_on: ["01-PLAN.md"]
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/clinics/clinics.module.ts
  - backend/src/clinics/clinics.service.ts
  - backend/src/clinics/clinics.controller.ts
  - backend/src/clients/clients.module.ts
  - backend/src/clients/clients.service.ts
  - backend/src/clients/clients.controller.ts
  - backend/src/pets/pets.module.ts
  - backend/src/pets/pets.service.ts
  - backend/src/pets/pets.controller.ts
autonomous: true
---

# Phase 2 Plan 2: Core Business Modules

## Goal
Establish the Multi-tenant foundation by creating the `Clinic`, `Client`, and `Pet` entities, and implementing their respective NestJS modules.

## Tasks

<task>
<id>1</id>
<title>Update Prisma Schema</title>
<type>execute</type>
<read_first>
- backend/prisma/schema.prisma
</read_first>
<action>
Update `backend/prisma/schema.prisma` with the new models:
1. `Clinic`: id (UUID), name, address, phone.
2. Update `User`: add `clinicId` (UUID, nullable, relation to Clinic).
3. `Client`: id (UUID), name, email, phone, `clinicId` (relation to Clinic).
4. `Pet`: id (UUID), name, species, breed, age (Int), `clientId` (relation to Client).
</action>
<acceptance_criteria>
- `backend/prisma/schema.prisma` contains `model Clinic`
- `backend/prisma/schema.prisma` contains `model Client`
- `backend/prisma/schema.prisma` contains `model Pet`
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>[BLOCKING] Schema Push Required</title>
<type>execute</type>
<read_first>
- backend/prisma/schema.prisma
</read_first>
<action>
Run `npx prisma db push --accept-data-loss` in the `backend` directory to apply the new models to the local PostgreSQL database, then run `npx prisma generate`.
</action>
<acceptance_criteria>
- `npx prisma db push` executes successfully
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Implement Clinics Module</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
</read_first>
<action>
Run `npx @nestjs/cli g res clinics --no-spec` in the `backend` directory. Select REST API and generate CRUD entry points.
Implement basic CRUD using `PrismaService` in `ClinicsService`.
</action>
<acceptance_criteria>
- `backend/src/clinics/clinics.controller.ts` exists
- `backend/src/clinics/clinics.service.ts` exists
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Implement Clients and Pets Modules</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
</read_first>
<action>
1. Run `npx @nestjs/cli g res clients --no-spec` in `backend`. Select REST API.
2. Run `npx @nestjs/cli g res pets --no-spec` in `backend`. Select REST API.
3. Implement basic CRUD for both using `PrismaService`.
</action>
<acceptance_criteria>
- `backend/src/clients/clients.controller.ts` exists
- `backend/src/pets/pets.controller.ts` exists
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Prisma schema reflects all core entities
- All REST resource controllers are generated and compile successfully
</criteria>
</verification>

<must_haves>
- [x] Clinics Module (multi-tenant)
- [x] Clients Module (pet owners)
- [x] Pets Module
</must_haves>
