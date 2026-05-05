---
wave: 1
depends_on: []
files_modified:
  - backend/package.json
  - backend/prisma/schema.prisma
  - backend/src/prisma/prisma.service.ts
  - backend/src/prisma/prisma.module.ts
  - backend/src/users/users.service.ts
  - backend/src/users/users.module.ts
  - backend/src/auth/auth.service.ts
  - backend/src/auth/auth.controller.ts
  - backend/src/auth/auth.module.ts
  - backend/src/auth/jwt.strategy.ts
  - backend/src/app.module.ts
autonomous: true
---

# Phase 2 Plan 1: Database Setup and Authentication

## Goal
Setup Prisma with PostgreSQL, create the initial `User` model, and implement the Auth module using JWT.

## Tasks

<task>
<id>1</id>
<title>Initialize Prisma and Database Schema</title>
<type>execute</type>
<read_first>
- backend/package.json
</read_first>
<action>
1. Navigate to `backend` and install Prisma: `npm install -D prisma` and `npm install @prisma/client`.
2. Initialize Prisma: `npx prisma init`.
3. Update `backend/prisma/schema.prisma` to use `postgresql`.
4. Create the `User` model with fields: `id` (UUID), `email` (String, unique), `password` (String), `role` (Enum: ADMIN, VET, RECEPTIONIST, CLIENT), `createdAt`, `updatedAt`.
5. Ensure `.env` in `backend` has `DATABASE_URL="postgresql://vetos:vetospassword@localhost:5432/vetos?schema=public"`.
</action>
<acceptance_criteria>
- `backend/prisma/schema.prisma` contains `model User`
- `backend/.env` contains `DATABASE_URL`
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
Run `npx prisma db push --accept-data-loss` in the `backend` directory to apply the User schema to the local PostgreSQL database, then run `npx prisma generate`.
</action>
<acceptance_criteria>
- `npx prisma db push` executes successfully
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Create Prisma Module and Service</title>
<type>execute</type>
<read_first>
- backend/src/app.module.ts
</read_first>
<action>
Generate a Prisma module and service in NestJS:
`npx @nestjs/cli g module prisma` and `npx @nestjs/cli g service prisma`.
Make `PrismaService` extend `PrismaClient` and implement `OnModuleInit`.
Export `PrismaService` from `PrismaModule` and import it into `AppModule`.
</action>
<acceptance_criteria>
- `backend/src/prisma/prisma.service.ts` contains `extends PrismaClient`
- `backend/src/prisma/prisma.module.ts` exports `PrismaService`
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Implement Users and Auth Modules</title>
<type>execute</type>
<read_first>
- backend/src/prisma/prisma.service.ts
- backend/package.json
</read_first>
<action>
1. Install auth dependencies: `npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt` and `npm install -D @types/passport-jwt @types/bcrypt`.
2. Generate `UsersModule` and `UsersService`. Implement `findByEmail` and `create` user methods (hashing password with bcrypt).
3. Generate `AuthModule`, `AuthService`, and `AuthController`. 
4. Implement `login` and `register` endpoints in `AuthController`.
5. Implement `JwtStrategy` for Passport validation.
6. Configure `JwtModule` in `AuthModule` with a secret key (use a default like 'super-secret' for dev, loaded from env).
</action>
<acceptance_criteria>
- `backend/src/auth/auth.controller.ts` has `@Post('login')` and `@Post('register')`
- `backend/src/auth/jwt.strategy.ts` exists and implements `PassportStrategy`
</acceptance_criteria>
</task>

## Verification
<verification>
<criteria>
- Prisma client is generated and DB is synced
- AuthController endpoints are defined
- Application compiles successfully
</criteria>
</verification>

<must_haves>
- [x] Auth Module (JWT)
</must_haves>
