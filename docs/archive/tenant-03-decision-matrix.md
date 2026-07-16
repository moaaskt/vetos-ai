# Tenant Decision Matrix & Classification

Este documento detalha como a extensão do Prisma decide se deve ou não injetar o filtro de inquilino em uma determinada operação de banco de dados.

---

## 1. Classificação dos Modelos do Schema

Auditamos todos os modelos declarados no `schema.prisma` e os categorizamos estritamente em:

### A. Modelos Filtráveis (Possuem coluna `clinicId`)
Estes modelos representam dados pertencentes a clínicas específicas e devem ser isolados automaticamente:
* `User`, `Client`, `Pet`, `Appointment`, `ClinicSubscription`, `WeightRecord`, `Allergy`, `VaccineRecord`, `VaccineProtocol`, `ClinicalRecord`, `NotificationConfig`, `NotificationTemplate`, `NotificationLog`, `ClinicalAttachment`, `Prescription`, `ConsentTemplate`, `ConsentTerm`.

### B. Modelos Globais / Não Filtráveis (Não possuem `clinicId`)
Modelos transversais à aplicação ou de suporte estrutural:
* `Clinic` (Entidade Tenant raiz)
* `Plan` (Plano global de assinatura)
* `ImpersonationLog` (Utiliza targetClinicId)
* `VaccineProtocolDose` (Normalização interna do protocolo)
* `TutorIdentity` (Identidade unificada do Tutor)
* `TutorPortalToken` (Token temporário de portal de tutores)
* `TutorSession` (Sessão de portal de tutores)

---

## 2. Fluxo da Lógica de Decisão (`evaluateDecision`)

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

## 3. Logs de Auditoria Estruturados

Quando a extensão do Prisma está ativa no modo `LOG` ou `FULL`, ela gera logs detalhados para cada consulta interceptada em ambiente de desenvolvimento (`process.env.NODE_ENV !== 'production'`).

**Formato do Log**:
```text
[TenantPrismaExtension] [Prisma Query Audit] Model: Client | Operation: findMany | TenantId: clinic-123 | Decision: FILTERED | Applied: true | Reason: Tenant isolation active for clinicId 'clinic-123'.
```

---

## 4. Navegação

* **[01. Visão Geral (01-overview.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/01-overview.md)**
* **[02. Auditoria e Dívida Técnica (02-query-audit.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/02-query-audit.md)**
* **03. Matriz de Decisão e Classificação (Este documento)**
* **[04. Plano de Ativação e Feature Flags (04-activation-plan.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/04-activation-plan.md)**
