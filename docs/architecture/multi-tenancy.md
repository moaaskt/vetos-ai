# Multi-tenancy Isolation Architecture

O VetOS AI utiliza uma arquitetura SaaS de **banco de dados compartilhado com isolamento lógico** baseado em contexto assíncrono e extensões nativas do Prisma ORM.

## 1. Fluxo de Execução e Contexto

Para garantir que o isolamento de dados seja transparente para os desenvolvedores e à prova de falhas operacionais, a requisição passa pelo seguinte fluxo lógico:

```text
HTTP Request (com JWT)
  ↓
[TenantMiddleware] ─── Decodifica clinicId e isSuperAdmin do Token JWT
  ↓
[TenantContextService] ─── Abre escopo isolado via AsyncLocalStorage.run()
  ↓
[AuthGuard / NestJS Controller] ─── Executa a lógica de rotas/serviços
  ↓
[TenantPrismaService (Extension)] ─── Consulta clinicId ativa no contexto corrente
  ↓
Banco de Dados (PostgreSQL)
```

* **TenantMiddleware**: Registrado no início do ciclo de vida HTTP do NestJS (antes de Guards/Pipes), permitindo empacotar toda a thread lógica com `AsyncLocalStorage.run()`.
* **TenantContextService**: Gerencia a API nativa `AsyncLocalStorage` do Node.js para propagação segura do `clinicId` e permissões de Super Admin.

## 2. Matriz de Decisão da Extensão Prisma

A extensão intercepta chamadas do banco de dados e avalia dinamicamente a injeção do filtro através de `evaluateDecision`:

```text
Entrada da Query (Model, Operation)
  ↓
[Model possui clinicId?]
  ├── Não ──> BYPASS (Ignorar filtro)
  └── Sim ──> [Usuário é Super Admin?]
                ├── Sim ──> BYPASS (Ignorar filtro)
                └── Não ──> [clinicId está presente no contexto?]
                              ├── Não ──> BYPASS (Ignorar rota pública/login)
                              └── Sim ──> FILTER (Injeta where: { clinicId })
```

### Modelos Filtráveis (com `clinicId`)
* `User`, `Client`, `Pet`, `Appointment`, `ClinicSubscription`, `WeightRecord`, `Allergy`, `VaccineRecord`, `VaccineProtocol`, `ClinicalRecord`, `NotificationConfig`, `NotificationTemplate`, `NotificationLog`, `ClinicalAttachment`, `Prescription`, `ConsentTemplate`, `ConsentTerm`.

### Modelos Globais
* `Clinic`, `Plan`, `ImpersonationLog`, `VaccineProtocolDose`, `TutorIdentity`, `TutorPortalToken`, `TutorSession`.

## 3. Logs de Auditoria de Queries

Em modo de desenvolvimento (`process.env.NODE_ENV !== 'production'`), a extensão do Prisma gera logs detalhados:
```text
[TenantPrismaExtension] [Prisma Query Audit] Model: Client | Operation: findMany | TenantId: clinic-123 | Decision: FILTERED | Applied: true | Reason: Tenant isolation active for clinicId 'clinic-123'.
```

## 4. Dívida Técnica Mapeada (Sprint 1.6)

Atualmente existem operações no backend dependentes do padrão **Validate-then-Operate** (validar a posse do pet em uma leitura prévia e atualizar/remover na query final apenas utilizando a chave primária `{ id }` sem checar `{ clinicId }`).
Estes endpoints e services devem ser refatorados para usar métodos de lote do Prisma, que forçam o filtro `{ clinicId }` nativamente:

* **Clients Service**: `client.update({ where: { id } })` → `updateMany({ where: { id, clinicId } })`
* **Clinical Attachments Service**: `clinicalAttachment.delete({ where: { id } })` → `deleteMany({ where: { id, clinicId } })`
* **Consent Terms Service**: `consentTerm.update` & `delete` → `updateMany` & `deleteMany`
* **Prescriptions Service**: `prescription.update` & `delete` → `updateMany` & `deleteMany`
* **Vaccines Service**: `vaccineProtocol.update` & `delete`, `vaccineRecord.update` → `updateMany` & `deleteMany`

## 5. Feature Flags e Plano de Ativação

A extensão possui 5 modos de operação controlados por `TENANT_EXTENSION_MODE`:
* `OFF`: Inativa.
* `LOG`: Registra logs de auditoria sem alterar queries.
* `FILTER_READ`: Aplica filtros apenas nas operações de leitura.
* `FILTER_WRITE`: Aplica filtros apenas nas operações de escrita.
* `FULL`: Aplica em todas as operações elegíveis (leitura e escrita).
