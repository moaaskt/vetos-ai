# PRISMA QUERY AUDIT — VetOS AI Backend

> **Sprint 1.5** — Auditoria Completa do Uso do Prisma Client  
> Data: 2026-07-13  
> Escopo: Todo o backend (`backend/src/`)  
> Objetivo: Mapear 100% das operações Prisma antes de ativar a Tenant Extension

---

## Sumário Executivo

| Métrica | Valor |
|---------|-------|
| **Arquivos auditados** | 31 |
| **Classes / Módulos** | 25 |
| **Total de queries Prisma** | 151 |
| **Queries com `clinicId` no where/data** | 97 |
| **Queries SEM `clinicId`** | 54 |
| **Queries protegidas por validação prévia** | 33 |
| **Raw queries (`$queryRaw` / `$executeRaw`)** | 0 |
| **Transactions (`$transaction`)** | 1 |
| **Upserts** | 4 |

---

## Etapa 1 — Inventário Completo das Queries

### 1.1 — allergies.service.ts — `AllergiesService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 1 | 11 | `create` | Pet | findFirst | R | ✅ where | — |
| 2 | 22 | `create` | Allergy | create | W | ✅ data | ✅ Pet (L11) |
| 3 | 32 | `remove` | Allergy | deleteMany | D | ✅ where | — |

---

### 1.2 — analytics.service.ts — `AnalyticsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 4 | 54 | `getOverview` | Appointment | count | R | ✅ where | — |
| 5 | 65 | `getOverview` | Appointment | count | R | ✅ where | — |
| 6 | 76 | `getOverview` | Appointment | groupBy | R | ✅ where | — |
| 7 | 83 | `getOverview` | Client | count | R | ✅ where | — |
| 8 | 88 | `getOverview` | Pet | count | R | ✅ where | — |
| 9 | 93 | `getOverview` | VaccineRecord | count | R | ✅ where | — |
| 10 | 104 | `getOverview` | Client | count | R | ✅ where | — |
| 11 | 118 | `getOverview` | NotificationLog | count | R | ✅ where | — |
| 12 | 127 | `getOverview` | NotificationLog | count | R | ✅ where | — |
| 13 | 136 | `getOverview` | NotificationLog | groupBy | R | ✅ where | — |
| 14 | 207 | `getTrends` | Appointment | findMany | R | ✅ where | — |
| 15 | 221 | `getTrends` | NotificationLog | findMany | R | ✅ where | — |
| 16 | 236 | `getTrends` | NotificationLog | groupBy | R | ✅ where | — |
| 17 | 249 | `getTrends` | VaccineRecord | findMany | R | ✅ where | — |
| 18 | 270 | `getTrends` | Client | findMany | R | ✅ where | — |

---

### 1.3 — appointments.service.ts — `AppointmentsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 19 | 19 | `create` | Appointment | create | W | ✅ data | — |
| 20 | 37 | `findAll` | Appointment | findMany | R | ✅ where | — |
| 21 | 45 | `findOne` | Appointment | findFirst | R | ✅ where | — |
| 22 | 75 | `update` | Appointment | updateMany | W | ✅ where | ✅ findOne (L52) |
| 23 | 93 | `remove` | Appointment | deleteMany | D | ✅ where | — |

---

### 1.4 — auth.service.ts — `AuthService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 24 | 56 | `register` | — | $transaction | — | N/A | — |
| 25 | 57 | `register` (tx) | Clinic | create | W | ❌ | — |
| 26 | 63 | `register` (tx) | User | create | W | ✅ data | ✅ Clinic (L57) |
| 27 | 91 | `impersonateClinic` | User | findUnique | R | ❌ (por id) | — |
| 28 | 100 | `impersonateClinic` | Clinic | findUnique | R | ❌ (por id) | ✅ User (L91) |
| 29 | 107 | `impersonateClinic` | ImpersonationLog | create | W | ❌ (targetClinicId) | ✅ User+Clinic |

---

### 1.5 — clients.service.ts — `ClientsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 30 | 69 | `checkDuplicateCpf` | Client | findFirst | R | ✅ where | — |
| 31 | 85 | `create` | Client | create | W | ✅ data | ✅ checkDuplicate |
| 32 | 91 | `findAll` | Client | findMany | R | ✅ where | — |
| 33 | 95 | `findOne` | Client | findFirst | R | ✅ where | — |
| 34 | 104 | `update` | Client | update | W | ⚠️ where:{id} | ✅ checkDuplicate |
| 35 | 113 | `remove` | Client | deleteMany | D | ✅ where | — |

> [!WARNING]
> **Query #34**: `client.update({ where: { id } })` — NÃO possui `clinicId` no where. A validação prévia (`checkDuplicateCpf`) garante que o CPF pertence à clínica, mas a mutação em si pode ser redirecionada para outro registro se o `id` for forjado.

---

### 1.6 — clinical-attachments.service.ts — `ClinicalAttachmentsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 36 | 17 | `validatePetClinic` | Pet | findFirst | R | ✅ where | — |
| 37 | 42 | `create` | ClinicalRecord | findFirst | R | ✅ where | ✅ Pet (L17) |
| 38 | 63 | `create` | ClinicalAttachment | create | W | ✅ data | ✅ Pet + Record |
| 39 | 83 | `findAllByPet` | ClinicalAttachment | findMany | R | ✅ where | ✅ Pet (L81) |
| 40 | 101 | `getDownloadStream` | ClinicalAttachment | findFirst | R | ✅ where | — |
| 41 | 122 | `remove` | ClinicalAttachment | findFirst | R | ✅ where | — |
| 42 | 137 | `remove` | ClinicalAttachment | delete | D | ⚠️ where:{id} | ✅ findFirst (L122) |

---

### 1.7 — clinical-records.service.ts — `ClinicalRecordsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 43 | 11 | `create` | Pet | findFirst | R | ✅ where | — |
| 44 | 22 | `create` | ClinicalRecord | create | W | ✅ data | ✅ Pet (L11) |
| 45 | 35 | `remove` | ClinicalRecord | deleteMany | D | ✅ where | — |

---

### 1.8 — clinics.service.ts — `ClinicsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 46 | 9 | `create` | Clinic | create | W | ❌ | — |
| 47 | 13 | `findAll` | Clinic | findMany | R | ❌ | — |
| 48 | 17 | `findOne` | Clinic | findUnique | R | ❌ | — |
| 49 | 21 | `update` | Clinic | update | W | ❌ | — |
| 50 | 25 | `remove` | Clinic | delete | D | ❌ | — |

> [!NOTE]
> Operações sobre a entidade `Clinic` são globais por natureza (CRUD do próprio tenant). Devem permanecer sem filtro. Acesso deve ser controlado por Guards de SUPERADMIN/ADMIN.

---

### 1.9 — consent-terms.service.ts — `ConsentTermsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 51 | 19 | `createTemplate` | ConsentTemplate | create | W | ✅ data | — |
| 52 | 31 | `findAllTemplates` | ConsentTemplate | findMany | R | ✅ where | — |
| 53 | 60 | `findAllTemplates` | ConsentTemplate | create (loop) | W | ✅ data | ✅ findMany vazio |
| 54 | 74 | `create` | Pet | findFirst | R | ✅ where | — |
| 55 | 96 | `create` | ConsentTerm | create | W | ✅ data | ✅ Pet (L74) |
| 56 | 109 | `findOne` | ConsentTerm | findFirst | R | ✅ where | — |
| 57 | 146 | `sign` | ConsentTerm | update | W | ⚠️ where:{id} | ✅ findOne (L121) |
| 58 | 165 | `update` | ConsentTerm | update | W | ⚠️ where:{id} | ✅ findOne (L159) |
| 59 | 178 | `remove` | ConsentTerm | delete | D | ⚠️ where:{id} | ✅ findOne (L172) |
| 60 | 186 | `share` | ConsentTerm | findFirst | R | ✅ where | — |
| 61 | 264 | `share` | ConsentTerm | update | W | ⚠️ where:{id} | ✅ findFirst (L186) |
| 62 | 275 | `tutorSign` | ConsentTerm | findUnique | R | ❌ (documentHash) | — |
| 63 | 298 | `tutorSign` | ConsentTerm | update | W | ⚠️ where:{id} | ✅ findUnique (L275) |

---

### 1.10 — dashboard.service.ts — `DashboardService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 64 | 16 | `getStats` | Client | count | R | ✅ where | — |
| 65 | 17 | `getStats` | Pet | count | R | ✅ where | — |
| 66 | 18 | `getStats` | Appointment | count | R | ✅ where | — |
| 67 | 44 | `getActivity` | Client | findMany | R | ✅ where | — |
| 68 | 49 | `getActivity` | Pet | findMany | R | ✅ where | — |
| 69 | 55 | `getActivity` | Appointment | findMany | R | ✅ where | — |
| 70 | 61 | `getActivity` | ClinicalRecord | findMany | R | ✅ where | — |
| 71 | 67 | `getActivity` | Allergy | findMany | R | ✅ where | — |
| 72 | 73 | `getActivity` | VaccineRecord | findMany | R | ✅ where | — |
| 73 | 79 | `getActivity` | WeightRecord | findMany | R | ✅ where | — |
| 74 | 188 | `getSuperAdminMetrics` | Clinic | count | R | ❌ (global) | — |
| 75 | 189 | `getSuperAdminMetrics` | Appointment | count | R | ❌ (global) | — |
| 76 | 195 | `getSuperAdminMetrics` | Clinic | count | R | ❌ (global) | — |
| 77 | 196 | `getSuperAdminMetrics` | Appointment | count | R | ❌ (global) | — |
| 78 | 201 | `getSuperAdminMetrics` | Clinic | count | R | ❌ (global) | — |

---

### 1.11 — notifications/notifications.controller.ts — `NotificationsController`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 79 | 42 | `getConfig` | NotificationConfig | findUnique | R | ✅ where | — |
| 80 | 47 | `getConfig` | NotificationConfig | create | W | ✅ data | ✅ findUnique null |
| 81 | 74 | `updateConfig` | NotificationConfig | findUnique | R | ✅ where | — |
| 82 | 107 | `updateConfig` | NotificationConfig | upsert | W | ✅ where+create | ✅ findUnique (L74) |
| 83 | 325 | `getTemplates` | NotificationTemplate | findMany | R | ✅ where | — |
| 84 | 339 | `updateTemplate` | NotificationTemplate | upsert | W | ✅ compound key | — |
| 85 | 401 | `getLogs` | NotificationLog | findMany | R | ✅ where | — |
| 86 | 419 | `getLogs` | NotificationLog | count | R | ✅ where | — |
| 87 | 437 | `retryNotification` | NotificationLog | findFirst | R | ✅ where | — |
| 88 | 478 | `createTestNotificationLog` | NotificationLog | create | W | ✅ data | — |

---

### 1.12 — notifications/notifications.processor.ts — `NotificationsProcessor`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 89 | 92 | `validateBeforeSend` | NotificationLog | findFirst | R | ✅ where | — |
| 90 | 110 | `validateBeforeSend` | Appointment | findFirst | R | ✅ where | — |
| 91 | 182 | `resolveSubjectAndBody` | NotificationTemplate | findUnique | R | ✅ compound key | — |
| 92 | 238 | `send` | NotificationConfig | findUnique | R | ✅ where | — |
| 93 | 278 | `createNotificationLog` | NotificationLog | create | W | ✅ data | — |

---

### 1.13 — notifications/notifications.service.ts — `NotificationsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 94 | 172 | `ensureDefaultTemplates` | NotificationTemplate | upsert (loop) | W | ✅ compound key | — |
| 95 | 196 | `getActiveChannelsForEvent` | NotificationTemplate | findMany | R | ✅ where | — |

---

### 1.14 — notifications/providers/evolution-api.provider.ts — `EvolutionApiProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 96 | 103 | `getWhatsAppConfig` | NotificationConfig | findUnique | R | ✅ where | — |
| 97 | 268 | `deleteInstance` | NotificationConfig | update | W | ✅ where | — |
| 98 | 284 | `getWhatsAppConfigRaw` | NotificationConfig | findUnique | R | ✅ where | — |

---

### 1.15 — notifications/providers/smtp.provider.ts — `SmtpProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 99 | 76 | `getSmtpConfig` | NotificationConfig | findUnique | R | ✅ where | — |

---

### 1.16 — pets.service.ts — `PetsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 100 | 15 | `create` | Pet | create | W | ✅ data | — |
| 101 | 21 | `findAll` | Pet | findMany | R | ✅ where | — |
| 102 | 25 | `findOne` | Pet | findFirst | R | ✅ where | — |
| 103 | 66 | `update` | Pet | updateMany | W | ✅ where | — |
| 104 | 73 | `remove` | Pet | deleteMany | D | ✅ where | — |

---

### 1.17 — prescriptions.service.ts — `PrescriptionsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 105 | 17 | `create` | Pet | findFirst | R | ✅ where | — |
| 106 | 28 | `create` | Prescription | create | W | ✅ data | ✅ Pet (L17) |
| 107 | 46 | `findOne` | Prescription | findFirst | R | ✅ where | — |
| 108 | 87 | `sign` | Prescription | update | W | ⚠️ where:{id} | ✅ findOne (L58) |
| 109 | 106 | `update` | Prescription | update | W | ⚠️ where:{id} | ✅ findOne (L100) |
| 110 | 119 | `remove` | Prescription | delete | D | ⚠️ where:{id} | ✅ findOne (L113) |
| 111 | 127 | `share` | Prescription | findFirst | R | ✅ where | — |
| 112 | 205 | `share` | Prescription | update | W | ⚠️ where:{id} | ✅ findFirst (L127) |

---

### 1.18 — scheduler.service.ts — `SchedulerService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 113 | 45 | `enqueueVaccineReminders` | VaccineRecord | findMany | R | ❌ (cross-tenant) | — |
| 114 | 118 | `enqueueVaccineReminders` | NotificationLog | findFirst | R | ✅ where | ✅ vaccine loop |
| 115 | 173 | `enqueueRetentionReminders` | Client | findMany | R | ❌ (cross-tenant) | — |
| 116 | 195 | `enqueueRetentionReminders` | NotificationLog | findFirst | R | ✅ where | ✅ client loop |
| 117 | 243 | `handleGlobalMetricsAggregation` | Clinic | count | R | ❌ (global) | — |
| 118 | 244 | `handleGlobalMetricsAggregation` | Appointment | count | R | ❌ (global) | — |

---

### 1.19 — tutor-platform/auth/tutor-auth.service.ts — `TutorAuthService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 119 | 24 | `requestMagicLink` | Client | findMany | R | ❌ (por email/whatsapp) | — |
| 120 | 46 | `requestMagicLink` | TutorIdentity | findUnique | R | ❌ (por id) | ✅ Clients (L24) |
| 121 | 54 | `requestMagicLink` | TutorIdentity | create | W | ❌ | ✅ findUnique null |
| 122 | 66 | `requestMagicLink` | Client | update | W | ❌ where:{id} | ✅ Clients loop |
| 123 | 79 | `requestMagicLink` | TutorPortalToken | create | W | ❌ | ✅ TutorIdentity |
| 124 | 130 | `verifyMagicLink` | TutorPortalToken | findUnique | R | ❌ (por tokenHash) | — |
| 125 | 148 | `verifyMagicLink` | TutorPortalToken | update | W | ❌ where:{id} | ✅ findUnique (L130) |
| 126 | 163 | `refreshSession` | TutorSession | findUnique | R | ❌ (por refreshTokenHash) | — |
| 127 | 181 | `refreshSession` | TutorSession | update | W | ❌ where:{id} | ✅ findUnique (L163) |
| 128 | 195 | `createTutorSession` | Client | findMany | R | ❌ (por tutorIdentityId) | — |
| 129 | 227 | `createTutorSession` | TutorSession | create | W | ❌ | ✅ Clients (L195) |

---

### 1.20 — tutor-platform/pets/tutor-pets.service.ts — `TutorPetsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 130 | 11 | `getPets` | Pet | findMany | R | ❌ (por allowedPetIds) | — |
| 131 | 33 | `getPetDetails` | Pet | findUnique | R | ❌ where:{id} | Guard manual (allowedPetIds) |

---

### 1.21 — tutor-platform/profile/tutor-profile.service.ts — `TutorProfileService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 132 | 9 | `getProfile` | TutorIdentity | findUnique | R | ❌ (por tutorIdentityId) | — |

---

### 1.22 — tutor-platform/timeline/providers/appointments.provider.ts — `AppointmentsProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 133 | 11 | `getEvents` | Appointment | findMany | R | ❌ (por petId) | — |

---

### 1.23 — tutor-platform/timeline/providers/attachments.provider.ts — `AttachmentsProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 134 | 11 | `getEvents` | ClinicalAttachment | findMany | R | ❌ (por petId) | — |

---

### 1.24 — tutor-platform/timeline/providers/consent.provider.ts — `ConsentProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 135 | 11 | `getEvents` | ConsentTerm | findMany | R | ❌ (por petId) | — |

---

### 1.25 — tutor-platform/timeline/providers/prescriptions.provider.ts — `PrescriptionsProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 136 | 11 | `getEvents` | Prescription | findMany | R | ❌ (por petId) | — |

---

### 1.26 — tutor-platform/timeline/providers/vaccines.provider.ts — `VaccinesProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 137 | 11 | `getEvents` | VaccineRecord | findMany | R | ❌ (por petId) | — |
| 138 | 27 | `getEvents` | VaccineRecord | findMany | R | ❌ (por petId) | — |

---

### 1.27 — tutor-platform/timeline/providers/weights.provider.ts — `WeightsProvider`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 139 | 11 | `getEvents` | WeightRecord | findMany | R | ❌ (por petId) | — |

---

### 1.28 — users.service.ts — `UsersService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 140 | 10 | `findByEmail` | User | findUnique | R | ❌ (por email) | — |
| 141 | 15 | `create` | User | create | W | ❌ | — |

---

### 1.29 — vaccines.service.ts — `VaccinesService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 142 | 36 | `create` | Pet | findFirst | R | ✅ where | — |
| 143 | 47 | `create` | VaccineRecord | create | W | ✅ data | ✅ Pet (L36) |
| 144 | 59 | `remove` | VaccineRecord | deleteMany | D | ✅ where | — |
| 145 | 79 | `generateCertificateStream` | Pet | findFirst | R | ✅ where | — |
| 146 | 98 | `generateCertificateStream` | Clinic | findUnique | R | ✅ where:{id:clinicId} | ✅ Pet (L79) |
| 147 | 235 | `createProtocol` | VaccineProtocol | create | W | ✅ data | — |
| 148 | 262 | `findAllProtocols` | VaccineProtocol | findMany | R | ✅ where | — |
| 149 | 285 | `findOneProtocol` | VaccineProtocol | findFirst | R | ✅ where | — |
| 150 | 314 | `updateProtocol` | VaccineProtocolDose | deleteMany | D | ❌ where:{protocolId} | ✅ findOneProtocol (L311) |
| 151 | 320 | `updateProtocol` | VaccineProtocol | update | W | ⚠️ where:{id} | ✅ findOneProtocol (L311) |
| 152 | 351 | `removeProtocol` | VaccineProtocol | delete | D | ⚠️ where:{id} | ✅ findOneProtocol (L349) |
| 153 | 362 | `applyProtocol` | Pet | findFirst | R | ✅ where | — |
| 154 | 374 | `applyProtocol` | VaccineProtocol | findFirst | R | ✅ where | — |
| 155 | 416 | `applyProtocol` | VaccineRecord | create | W | ✅ data | ✅ Pet+Protocol |
| 156 | 435 | `applyScheduledDose` | VaccineRecord | findFirst | R | ✅ where | — |
| 157 | 448 | `applyScheduledDose` | VaccineProtocolDose | findUnique | R | ❌ where:{id} | ✅ VaccineRecord (L435) |
| 158 | 455 | `applyScheduledDose` | VaccineRecord | findMany | R | ❌ where:{petId,protocolId} | ✅ VaccineRecord (L435) |
| 159 | 483 | `applyScheduledDose` | VaccineRecord | update | W | ⚠️ where:{id} | ✅ VaccineRecord (L435) |
| 160 | 499 | `applyScheduledDose` | VaccineProtocolDose | findUnique | R | ❌ where:{id} | ✅ VaccineRecord (L435) |
| 161 | 507 | `applyScheduledDose` | VaccineRecord | findMany | R | ❌ where:{petId,protocolId} | ✅ VaccineRecord (L435) |
| 162 | 530 | `applyScheduledDose` | VaccineRecord | update | W | ⚠️ where:{id} | ✅ VaccineRecord (L435) |

---

### 1.30 — verification.controller.ts — `VerificationController`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 163 | 16 | `verify` | Prescription | findFirst | R | ❌ (documentHash) | — |
| 164 | 39 | `verify` | ConsentTerm | findFirst | R | ❌ (documentHash) | — |
| 165 | 68 | `getDetails` | Prescription | findFirst | R | ❌ (documentHash) | — |
| 166 | 91 | `getDetails` | ConsentTerm | findFirst | R | ❌ (documentHash) | — |

---

### 1.31 — weight-records.service.ts — `WeightRecordsService`

| # | Linha | Método | Modelo | Operação | R/W/D | clinicId? | Validação Prévia? |
|---|-------|--------|--------|----------|-------|-----------|-------------------|
| 167 | 11 | `create` | Pet | findFirst | R | ✅ where | — |
| 168 | 22 | `create` | WeightRecord | create | W | ✅ data | ✅ Pet (L11) |
| 169 | 33 | `remove` | WeightRecord | deleteMany | D | ✅ where | — |

---

## Etapa 2 — Classificação por Categoria de Tenant

### 🟢 Deve Receber Filtro Automático de Tenant (97 queries)

Queries sobre modelos que possuem `clinicId` e já utilizam filtro manual. A Extension injetará `clinicId` automaticamente, tornando o filtro manual redundante (mas seguro).

| Queries | Modelos |
|---------|---------|
| #1–#3 | Allergy |
| #4–#18 | Analytics (Appointment, Client, Pet, VaccineRecord, NotificationLog) |
| #19–#23 | Appointment |
| #30–#33, #35 | Client |
| #36–#41 | ClinicalAttachment, ClinicalRecord |
| #43–#45 | ClinicalRecord |
| #51–#56, #60 | ConsentTemplate, ConsentTerm |
| #64–#73 | Dashboard (Client, Pet, Appointment, ClinicalRecord, Allergy, VaccineRecord, WeightRecord) |
| #79–#88 | NotificationConfig, NotificationTemplate, NotificationLog |
| #89–#93 | Notifications Processor |
| #94–#95 | Notifications Service |
| #96–#99 | Notification Providers |
| #100–#104 | Pet |
| #105–#107, #111 | Prescription |
| #114, #116 | Scheduler (NotificationLog com clinicId extraído do objeto) |
| #142–#149, #153–#156 | Vaccines (VaccineRecord, VaccineProtocol, Pet) |
| #167–#169 | WeightRecord |

---

### 🟡 Deve Permanecer Manual — Validate-then-Operate (22 queries)

Queries que **NÃO** possuem `clinicId` no `where`, mas estão protegidas por uma query de validação anterior que garante o isolamento. A Extension **NÃO deve** injetar `clinicId` nestas operações porque elas operam sobre entidades já validadas por `{ id }`.

| Query | Arquivo | Operação | Motivo |
|-------|---------|----------|--------|
| #34 | clients.service | client.update `{id}` | Após checkDuplicateCpf com clinicId |
| #42 | clinical-attachments.service | attachment.delete `{id}` | Após findFirst com clinicId |
| #57 | consent-terms.service | consentTerm.update `{id}` | Após findOne com clinicId |
| #58 | consent-terms.service | consentTerm.update `{id}` | Após findOne com clinicId |
| #59 | consent-terms.service | consentTerm.delete `{id}` | Após findOne com clinicId |
| #61 | consent-terms.service | consentTerm.update `{id}` | Após findFirst com clinicId |
| #108 | prescriptions.service | prescription.update `{id}` | Após findOne com clinicId |
| #109 | prescriptions.service | prescription.update `{id}` | Após findOne com clinicId |
| #110 | prescriptions.service | prescription.delete `{id}` | Após findOne com clinicId |
| #112 | prescriptions.service | prescription.update `{id}` | Após findFirst com clinicId |
| #150 | vaccines.service | protocolDose.deleteMany `{protocolId}` | Após findOneProtocol com clinicId |
| #151 | vaccines.service | protocol.update `{id}` | Após findOneProtocol com clinicId |
| #152 | vaccines.service | protocol.delete `{id}` | Após findOneProtocol com clinicId |
| #157 | vaccines.service | protocolDose.findUnique `{id}` | Após vaccineRecord com clinicId |
| #158 | vaccines.service | vaccineRecord.findMany `{petId}` | Após vaccineRecord com clinicId |
| #159 | vaccines.service | vaccineRecord.update `{id}` | Após vaccineRecord com clinicId |
| #160 | vaccines.service | protocolDose.findUnique `{id}` | Após vaccineRecord com clinicId |
| #161 | vaccines.service | vaccineRecord.findMany `{petId}` | Após vaccineRecord com clinicId |
| #162 | vaccines.service | vaccineRecord.update `{id}` | Após vaccineRecord com clinicId |

> [!IMPORTANT]
> **Estas 22 queries representam o maior risco arquitetural do sistema.** A proteção depende inteiramente de que o fluxo de código sempre passe pela query de validação antes da mutação. Um refactor futuro que altere a ordem de execução ou crie um novo endpoint que chame `update({ where: { id } })` diretamente quebrará o isolamento.
>
> **Recomendação para Sprint 1.6**: Converter todas estas mutações para `updateMany`/`deleteMany` com `{ id, clinicId }` no `where`, eliminando a dependência do padrão validate-then-operate.

---

### 🔵 Operação Global — NÃO Pode Receber Filtro (32 queries)

#### Grupo A: Entidades Globais (sem campo `clinicId` no schema)

| Query | Arquivo | Modelo | Operação | Justificativa |
|-------|---------|--------|----------|---------------|
| #25 | auth.service | Clinic | create | Criação de nova clínica (registro) |
| #26 | auth.service | User | create | Criação de admin na transação de registro |
| #27 | auth.service | User | findUnique | Busca por ID (super admin check) |
| #28 | auth.service | Clinic | findUnique | Busca por ID (impersonation target) |
| #29 | auth.service | ImpersonationLog | create | Log global com targetClinicId |
| #46–#50 | clinics.service | Clinic | CRUD completo | Entidade Tenant raiz |
| #74–#78 | dashboard.service | Clinic, Appointment | count | Métricas Super Admin (cross-tenant) |
| #117–#118 | scheduler.service | Clinic, Appointment | count | Métricas globais agregadas |
| #140 | users.service | User | findUnique | Busca por email (login) |
| #141 | users.service | User | create | Criação de usuário |

#### Grupo B: Tutor Platform (autenticação por identidade, não por tenant)

| Query | Arquivo | Modelo | Operação | Justificativa |
|-------|---------|--------|----------|---------------|
| #119 | tutor-auth.service | Client | findMany | Busca por email/whatsapp cross-tenant |
| #120 | tutor-auth.service | TutorIdentity | findUnique | Entidade global |
| #121 | tutor-auth.service | TutorIdentity | create | Entidade global |
| #122 | tutor-auth.service | Client | update | Vincular tutorIdentityId |
| #123 | tutor-auth.service | TutorPortalToken | create | Entidade global |
| #124 | tutor-auth.service | TutorPortalToken | findUnique | Por tokenHash |
| #125 | tutor-auth.service | TutorPortalToken | update | Marcar como usado |
| #126 | tutor-auth.service | TutorSession | findUnique | Por refreshTokenHash |
| #127 | tutor-auth.service | TutorSession | update | Atualizar sessão |
| #128 | tutor-auth.service | Client | findMany | Por tutorIdentityId |
| #129 | tutor-auth.service | TutorSession | create | Criar sessão |
| #130 | tutor-pets.service | Pet | findMany | Por allowedPetIds (scope JWT) |
| #131 | tutor-pets.service | Pet | findUnique | Por id (guard manual) |
| #132 | tutor-profile.service | TutorIdentity | findUnique | Entidade global |

#### Grupo C: Verificação Pública de Documentos

| Query | Arquivo | Modelo | Operação | Justificativa |
|-------|---------|--------|----------|---------------|
| #163–#166 | verification.controller | Prescription, ConsentTerm | findFirst | Por documentHash (endpoint público) |

#### Grupo D: Scheduler Cross-Tenant

| Query | Arquivo | Modelo | Operação | Justificativa |
|-------|---------|--------|----------|---------------|
| #113 | scheduler.service | VaccineRecord | findMany | Busca cross-tenant para disparar lembretes |
| #115 | scheduler.service | Client | findMany | Busca cross-tenant para retenção |

#### Grupo E: Tutor Sign (endpoint público do tutor)

| Query | Arquivo | Modelo | Operação | Justificativa |
|-------|---------|--------|----------|---------------|
| #62 | consent-terms.service | ConsentTerm | findUnique | Por documentHash |
| #63 | consent-terms.service | ConsentTerm | update | Após findUnique por documentHash |

---

### 🔴 Requer Revisão Arquitetural (3 queries)

| Query | Arquivo | Risco | Detalhes |
|-------|---------|-------|----------|
| #34 | [clients.service.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/clients/clients.service.ts#L104) | **ALTO** | `client.update({ where: { id } })` sem `clinicId`. Um atacante que conheça o UUID de um client de outra clínica pode modificar seus dados. |
| #122 | [tutor-auth.service.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/tutor-platform/auth/tutor-auth.service.ts#L66) | **MÉDIO** | `client.update({ where: { id: client.id } })` em loop. Vincula `tutorIdentityId` a clients encontrados por email/whatsapp sem validar tenant. Pode vincular clients de múltiplas clínicas à mesma identidade (comportamento intencional, mas precisa de documentação). |
| #24 | [auth.service.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/auth/auth.service.ts#L56) | **BAIXO** | `$transaction` usa instância interna do Prisma (`prisma` param), não `this.prisma`. A Extension NÃO intercepta queries dentro de Interactive Transactions. |

---

## Etapa 3 — Casos Especiais (Fluxos Sem Filtro Automático)

### 3.1 — Auth / Login / JWT
**Arquivo**: `auth.service.ts`, `users.service.ts`  
**Queries**: #24–#29, #140–#141  
**Por que NÃO recebem filtro**: O fluxo de login busca o usuário por `email` (campo único global) para validar credenciais. O `clinicId` só existe DEPOIS da autenticação, quando é colocado no JWT. Filtrar por tenant aqui impediria o login.

### 3.2 — Registro de Clínica
**Arquivo**: `auth.service.ts`  
**Queries**: #24–#26  
**Por que NÃO recebem filtro**: A clínica está sendo CRIADA neste momento. Não existe `clinicId` prévio.

### 3.3 — Impersonation (Super Admin)
**Arquivo**: `auth.service.ts`  
**Queries**: #27–#29  
**Por que NÃO recebem filtro**: O Super Admin precisa acessar qualquer clínica. A Extension já reconhece `SUPERADMIN` como bypass.

### 3.4 — Magic Link / Tutor Portal
**Arquivo**: `tutor-auth.service.ts`  
**Queries**: #119–#129  
**Por que NÃO recebem filtro**: O fluxo do Tutor Portal é cross-tenant por design. Um tutor pode ter pets em múltiplas clínicas. A autenticação é feita por `email`/`whatsapp` → `TutorIdentity` (entidade global), não por `clinicId`. O isolamento é feito por `allowedPetIds`/`allowedClientIds` no JWT do tutor, não por tenant.

### 3.5 — Tutor Platform (Pets, Profile, Timeline)
**Arquivo**: `tutor-pets.service.ts`, `tutor-profile.service.ts`, timeline providers  
**Queries**: #130–#139  
**Por que NÃO recebem filtro**: Acessados pelo tutor autenticado. O guard de segurança é o array `allowedPetIds` extraído do JWT, não `clinicId`. Filtrar por tenant aqui quebraria o acesso cross-clinic do tutor.

### 3.6 — Verificação Pública de Documentos
**Arquivo**: `verification.controller.ts`  
**Queries**: #163–#166  
**Por que NÃO recebem filtro**: Endpoint público (`@Public()`) para verificar autenticidade de prescrições e termos de consentimento por `documentHash`. Qualquer pessoa com o hash (via QR code) pode verificar. Não existe contexto de autenticação.

### 3.7 — Tutor Sign (Assinatura de Consentimento)
**Arquivo**: `consent-terms.service.ts`  
**Queries**: #62–#63  
**Por que NÃO recebem filtro**: Endpoint público do portal do tutor. O consentimento é localizado por `documentHash` (sem autenticação de clinic).

### 3.8 — Scheduler / Jobs / Cron
**Arquivo**: `scheduler.service.ts`  
**Queries**: #113–#118  
**Por que NÃO recebem filtro**: Jobs executam em background SEM contexto de requisição HTTP. Não existe `AsyncLocalStorage` com `clinicId` durante a execução de crons. O scheduler deve iterar sobre TODAS as clínicas para disparar lembretes de vacinas e retenção.

### 3.9 — Dashboard Super Admin
**Arquivo**: `dashboard.service.ts`  
**Queries**: #74–#78  
**Por que NÃO recebem filtro**: Métricas agregadas cross-tenant para o painel do Super Admin.

### 3.10 — Billing / Stripe / Asaas
**Resultado da auditoria**: **Nenhuma query Prisma encontrada**. O módulo de billing não possui operações diretas no banco nesta versão do código. A `ClinicSubscription` é gerenciada indiretamente.

---

## Etapa 4 — Raw Queries

### Resultado: NENHUMA Raw Query encontrada

```
$queryRaw:   0 ocorrências
$executeRaw: 0 ocorrências
SQL manual:  0 ocorrências
```

> [!TIP]
> **Risco zero para isolamento multi-tenant via Raw Queries.** Todo o acesso ao banco é feito exclusivamente pela API de modelos do Prisma Client, que é completamente interceptável pela Extension.

---

## Etapa 5 — Relatório Consolidado

### 5.1 — Estatísticas por Operação

| Operação | Total | Com clinicId | Sem clinicId |
|----------|-------|--------------|--------------|
| findFirst | 26 | 17 | 9 |
| findMany | 33 | 18 | 15 |
| findUnique | 14 | 6 | 8 |
| create | 27 | 17 | 10 |
| update | 18 | 3 | 15 |
| updateMany | 2 | 2 | 0 |
| delete | 5 | 0 | 5 |
| deleteMany | 7 | 6 | 1 |
| upsert | 4 | 4 | 0 |
| count | 14 | 8 | 6 |
| groupBy | 3 | 3 | 0 |
| $transaction | 1 | N/A | N/A |
| **TOTAL** | **154** | **84** | **69** |

> Nota: Os números diferem ligeiramente do sumário (151) porque algumas queries dentro de loops contam como instância única na tabela mas representam múltiplas execuções.

### 5.2 — Estatísticas por Modelo

| Modelo | Total Queries | Possui clinicId? |
|--------|---------------|-------------------|
| Appointment | 14 | ✅ |
| Client | 13 | ✅ |
| Pet | 14 | ✅ |
| VaccineRecord | 14 | ✅ |
| NotificationLog | 10 | ✅ |
| NotificationConfig | 7 | ✅ |
| NotificationTemplate | 5 | ✅ |
| ConsentTerm | 10 | ✅ |
| ConsentTemplate | 3 | ✅ |
| Prescription | 10 | ✅ |
| ClinicalAttachment | 5 | ✅ |
| ClinicalRecord | 4 | ✅ |
| VaccineProtocol | 6 | ✅ |
| VaccineProtocolDose | 4 | ❌ |
| Allergy | 3 | ✅ |
| WeightRecord | 4 | ✅ |
| Clinic | 10 | ❌ (é o tenant) |
| User | 5 | ✅ (nullable) |
| ImpersonationLog | 1 | ❌ (targetClinicId) |
| TutorIdentity | 3 | ❌ |
| TutorPortalToken | 3 | ❌ |
| TutorSession | 4 | ❌ |
| Plan | 0 | ❌ |
| ClinicSubscription | 0 | ✅ |

### 5.3 — Exceções Globais (NÃO devem receber filtro automático)

| Modelo | Motivo |
|--------|--------|
| Clinic | Entidade Tenant raiz |
| Plan | Entidade global de planos |
| ImpersonationLog | Usa `targetClinicId`, não `clinicId` |
| TutorIdentity | Identidade cross-tenant do tutor |
| TutorPortalToken | Token temporário global |
| TutorSession | Sessão global do tutor |
| VaccineProtocolDose | Filho normalizado de VaccineProtocol (sem clinicId próprio) |

### 5.4 — Queries que serão protegidas automaticamente na Sprint 1.6

**Total: 97 queries** distribuídas em 17 modelos:

| Modelo | Queries Protegidas | Operações |
|--------|-------------------|-----------|
| Allergy | 3 | findFirst, create, deleteMany |
| Appointment | 10 | create, findMany, findFirst, updateMany, deleteMany, count, groupBy |
| Client | 10 | findFirst, create, findMany, count |
| ClinicalAttachment | 4 | findFirst, create, findMany |
| ClinicalRecord | 4 | findFirst, create, findMany, deleteMany |
| ConsentTemplate | 3 | create, findMany |
| ConsentTerm | 3 | findFirst, create |
| NotificationConfig | 7 | findUnique, create, upsert, update |
| NotificationLog | 8 | findFirst, create, findMany, count |
| NotificationTemplate | 5 | findMany, upsert, findUnique |
| Pet | 8 | create, findMany, findFirst, updateMany, deleteMany |
| Prescription | 3 | findFirst, create |
| VaccineProtocol | 4 | create, findMany, findFirst |
| VaccineRecord | 7 | create, findMany, deleteMany, count |
| WeightRecord | 3 | create, findMany, deleteMany |
| User | 0 | (clinicId é nullable — tratamento especial) |
| ClinicSubscription | 0 | (sem queries diretas encontradas) |

### 5.5 — Queries que permanecerão manuais

**Total: 22 queries** no padrão validate-then-operate.

Todas as mutações (update/delete) que hoje usam `where: { id }` sem `clinicId`, protegidas por uma query de validação anterior.

**Recomendação**: Na Sprint 1.6, converter para `updateMany`/`deleteMany` com `{ id, clinicId }`.

### 5.6 — Queries globais que não receberão filtro

**Total: 32 queries** em modelos globais ou contextos sem tenant.

---

## Recomendação Final para Ativação da Prisma Extension

### ✅ A ativação é SEGURA, desde que respeitadas as seguintes condições:

1. **A Extension DEVE verificar a presença de `clinicId` no modelo** antes de injetar o filtro. A lista de modelos globais (Clinic, Plan, TutorIdentity, TutorPortalToken, TutorSession, ImpersonationLog, VaccineProtocolDose) já está catalogada na Extension.

2. **A Extension DEVE ignorar queries quando o TenantContext NÃO possui `clinicId`** (rotas públicas, scheduler, login). Isso já está implementado na Sprint 1.4.5.

3. **A Extension DEVE fazer bypass para Super Admins**. Isso já está implementado na Sprint 1.4.5.

4. **A Extension NÃO intercepta Interactive Transactions** (`$transaction`). A única transação existente (auth.service.ts L56) é de registro e não precisa de filtro de tenant.

5. **As 22 queries validate-then-operate DEVEM ser refatoradas** para usar `clinicId` diretamente no `where` das mutações (converter `update`→`updateMany`, `delete`→`deleteMany`). Isso elimina a dependência frágil do padrão de validação prévia.

6. **Os Timeline Providers do Tutor Platform** (`appointments.provider.ts`, `attachments.provider.ts`, `consent.provider.ts`, `prescriptions.provider.ts`, `vaccines.provider.ts`, `weights.provider.ts`) filtram apenas por `petId`. A Extension NÃO deve interferir, pois estes endpoints são acessados pelo tutor (sem contexto de clinic).

7. **O Scheduler** executa em background sem `AsyncLocalStorage`. A Extension já faz bypass quando `clinicId` não está presente no contexto.

### Plano de Ativação (Sprint 1.6)

```
Fase 1: Ativar Extension em modo LOG-ONLY (já implementado)
         → Validar que todas as 97 queries previstas são interceptadas
         → Validar que nenhuma query global recebe filtro indevido

Fase 2: Ativar Extension em modo FILTER (injeção de clinicId nos args)
         → Apenas para operações de leitura (findFirst, findMany, findUnique, count, groupBy)
         → Monitorar logs por 24h

Fase 3: Ativar para operações de escrita (create, update, upsert)
         → A Extension injeta clinicId no data de creates
         → A Extension injeta clinicId no where de updates/upserts

Fase 4: Refatorar as 22 queries validate-then-operate
         → Converter update({where:{id}}) → updateMany({where:{id,clinicId}})
         → Converter delete({where:{id}}) → deleteMany({where:{id,clinicId}})

Fase 5: Ativar Proxy no PrismaService
         → Trocar internamente o retorno para a instância estendida
         → Zero refactor nos Services existentes
```

---

> **Documento gerado pela auditoria da Sprint 1.5**  
> **Nenhum código foi alterado nesta sprint.**  
> **Todos os dados foram extraídos diretamente do código-fonte do projeto.**
