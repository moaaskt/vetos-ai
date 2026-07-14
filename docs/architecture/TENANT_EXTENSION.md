# Tenant Prisma Extension Intelligence

Este documento detalha o funcionamento interno, a matriz de decisões, a catalogação dos modelos e a lógica de logs da extensão Prisma para multi-tenancy desenvolvida na **Sprint 1.4.5**.

---

## 1. Classificação dos Modelos do Banco (Drift/Schema Audit)

Auditoria exaustiva do `schema.prisma` classificou os modelos em duas categorias:

### A. Modelos Filtráveis (Possuem coluna `clinicId`)
Estes modelos representam dados pertencentes a clínicas específicas e devem ser isolados automaticamente.
* `User`
* `Client`
* `Pet`
* `Appointment`
* `ClinicSubscription`
* `WeightRecord`
* `Allergy`
* `VaccineRecord`
* `VaccineProtocol`
* `ClinicalRecord`
* `NotificationConfig`
* `NotificationTemplate`
* `NotificationLog`
* `ClinicalAttachment`
* `Prescription`
* `ConsentTemplate`
* `ConsentTerm`

### B. Modelos Globais / Não Filtráveis (Não possuem `clinicId`)
Modelos transversais à aplicação ou de suporte estrutural:
* `Clinic` (Entidade Tenant raiz)
* `Plan` (Plano global de assinatura)
* `ImpersonationLog` (Utiliza targetClinicId)
* `VaccineProtocolDose` (Dependência normalizada de dose)
* `TutorIdentity` (Identidade global unificada cross-tenant do Tutor)
* `TutorPortalToken` (Token temporário de portal de tutores)
* `TutorSession` (Sessão de portal de tutores)

---

## 2. Matriz de Decisão da Extensão

Cada instrução gerada pelo Prisma passa pelo validador `evaluateDecision` no arquivo `tenant-prisma.extension.ts`. A decisão de aplicar ou ignorar o filtro de tenant é tomada com base no seguinte fluxo lógico:

```text
Entrada da Query (Model, Operation)
  ↓
[Model possui clinicId?]
  ├── Não ──> BYPASS (Ignorar filtro)
  └── Sim ──> [Usuário é Super Admin?]
                ├── Sim ──> BYPASS (Ignorar filtro)
                └── Não ──> [clinicId está presente no contexto?]
                              ├── Não ──> BYPASS (Ignorar filtro - Rota pública/login)
                              └── Sim ──> FILTER (Aplicar isolamento do tenant)
```

---

## 3. Logs Estruturados de Auditoria

Para facilitar a depuração e auditoria sem degradar a performance em ambiente produtivo, adicionamos logs detalhados acionados apenas em modo desenvolvimento (`process.env.NODE_ENV !== 'production'`).
* **Estrutura do Log**:
  ```text
  [TenantPrismaExtension] [Prisma Query Audit] Model: Client | Operation: findMany | TenantId: clinic-123 | Decision: FILTERED | Reason: Tenant isolation active for clinicId 'clinic-123'.
  ```

---

## 4. Próximos Passos (Para a Sprint 1.5)

Na **Sprint 1.5**, faremos a ativação real do filtro de isolamento alterando as queries:
1. **Mutação de Argumentos (Args injection)**: Injetar `{ where: { clinicId } }` em operações de leitura (`findFirst`, `findMany`, `findUnique`) e escrita (`update`, `delete`, `updateMany`, `deleteMany`).
2. **Proxy de Compatibilidade**: Modificar a inicialização do `PrismaService` original para retornar a instância estendida via Proxy JavaScript, ativando a blindagem em todo o backend sem exigir a refatoração manual de arquivos de serviços operacionais.
