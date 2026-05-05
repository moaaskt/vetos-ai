---
wave: 1
depends_on: []
files_modified:
  - backend/package.json
  - backend/prisma/schema.prisma
  - backend/src/prisma/prisma.service.ts
  - backend/src/prisma/prisma.module.ts
  - backend/src/clinics/clinics.service.ts
  - backend/src/clinics/clinics.controller.ts
  - backend/src/clinics/clinics.module.ts
  - backend/src/users/users.service.ts
  - backend/src/users/users.controller.ts
  - backend/src/users/users.module.ts
  - backend/src/auth/auth.service.ts
  - backend/src/auth/auth.controller.ts
  - backend/src/auth/auth.module.ts
  - backend/src/auth/jwt.strategy.ts
  - backend/src/auth/jwt-auth.guard.ts
  - backend/src/app.module.ts
autonomous: true
---

# Phase 2 Plan 1: Strict Multi-Tenant Schema, Clinics, and Auth

## Goal
Implement a strict multi-tenant SaaS architecture where `Clinic` is the root entity. All entities (`User`, `Client`, `Pet`) must be strictly linked to a `Clinic`. Users cannot exist without a `Clinic`. Role-based access control (ADMIN, STAFF) will be introduced.

## Tasks

<task>
<id>1</id>
<title>Strict Multi-Tenant Prisma Schema</title>
<type>execute</type>
<read_first>
- backend/package.json
</read_first>
<action>
1. Navigate to `backend` and install Prisma if not yet installed: `npm install -D prisma` and `npm install @prisma/client`.
2. Initialize Prisma: `npx prisma init`.
3. Update `backend/prisma/schema.prisma` to use `postgresql`.
4. Define the schema in the required order with STRICT relations (non-nullable `clinicId`):
   - `Role` enum: `ADMIN`, `STAFF`
   - `Clinic`: id (UUID), name, address, phone, createdAt, updatedAt
   - `User`: id (UUID), email (unique), password, role (Role), `clinicId` (UUID, non-nullable relation to Clinic), createdAt, updatedAt
   - `Client`: id (UUID), name, email, phone, `clinicId` (UUID, non-nullable relation to Clinic), createdAt, updatedAt
   - `Pet`: id (UUID), name, species, breed, age (Int), `clientId` (UUID, relation to Client), `clinicId` (UUID, non-nullable relation to Clinic for direct scoping), createdAt, updatedAt
5. Ensure `.env` in `backend` has `DATABASE_URL="postgresql://vetos:vetospassword@localhost:5432/vetos?schema=public"`.
</action>
<acceptance_criteria>
- `backend/prisma/schema.prisma` contains `model Clinic` and `model User`
- `backend/prisma/schema.prisma` enforces `clinicId` as non-nullable in `User`, `Client`, and `Pet`
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
Run `npx prisma db push --accept-data-loss` in the `backend` directory to apply the new multi-tenant models to the local PostgreSQL database, then run `npx prisma generate`.
</action>
<acceptance_criteria>
- `npx prisma db push` executes successfully
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Prisma and Clinic Modules</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
</read_first>
<action>
1. Generate Prisma module: `npx @nestjs/cli g module prisma` and `npx @nestjs/cli g service prisma`. Implement `OnModuleInit`.
2. Generate Clinics module: `npx @nestjs/cli g res clinics --no-spec` (REST API).
3. Implement basic Clinic CRUD in `ClinicsService`.
</action>
<acceptance_criteria>
- `backend/src/prisma/prisma.service.ts` exists and connects to PrismaClient
- `backend/src/clinics/clinics.service.ts` exists
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Users and Auth Modules with RBAC</title>
<type>execute</type>
<read_first>
- backend/src/prisma/prisma.service.ts
- backend/package.json
</read_first>
<action>
1. Install auth packages: `npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt` and `npm install -D @types/passport-jwt @types/bcrypt`.
2. Generate `UsersModule` and `UsersService`. Add methods to find/create users (must accept and link to a `clinicId`).
3. Generate `AuthModule`, `AuthService`, and `AuthController`. 
4. In `AuthController`, the `register` endpoint MUST accept clinic details along with user details to create the `Clinic` and the initial `User` (ADMIN) together via Prisma transaction.
5. Create `JwtStrategy` and `JwtAuthGuard`. The JWT payload must include `clinicId` and `role`.
6. Configure `JwtModule` with a default dev secret.
</action>
<acceptance_criteria>
- `backend/src/auth/auth.controller.ts` contains `login` and `register`
- `backend/src/auth/jwt.strategy.ts` decodes `clinicId` from payload
- `backend/src/users/users.service.ts` requires `clinicId` when creating a user
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Prisma schema enforces `clinicId` on all child entities
- Auth module issues JWTs that include `clinicId` and `role`
- Register endpoint handles creation of both Clinic and Admin User simultaneously
</criteria>
</verification>

<must_haves>
- [x] Strict Multi-Tenant architecture
- [x] Role-Based Access Control
</must_haves>
