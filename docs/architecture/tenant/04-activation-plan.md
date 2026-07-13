# Activation Plan & Feature Flags

Este documento descreve as Feature Flags disponíveis para a ativação da extensão Prisma e o plano detalhado de ativação em produção.

---

## 1. Feature Flag: `TENANT_EXTENSION_MODE`

A extensão pode ser executada em 5 modos diferentes, controlados pela variável de ambiente `TENANT_EXTENSION_MODE`:

* **`OFF` (Default)**: A extensão está completamente inativa e não intercepta logs nem altera argumentos.
* **`LOG`**: A extensão intercepta todas as consultas e registra logs de auditoria detalhando qual seria a decisão de isolamento, mas não altera os argumentos das consultas.
* **`FILTER_READ`**: Filtros de isolamento são aplicados automaticamente apenas nas operações de leitura:
  * `findMany`, `findFirst`, `findUnique`, `count`, `groupBy`.
* **`FILTER_WRITE`**: Filtros de isolamento são aplicados automaticamente apenas nas operações de escrita:
  * `create`, `createMany`, `update`, `updateMany`, `delete`, `deleteMany`, `upsert`.
* **`FULL`**: Filtros de isolamento são aplicados em todas as operações elegíveis (leitura e escrita).

---

## 2. Plano de Ativação (Sprint 1.6)

Para garantir uma migração livre de bugs e leaks, seguiremos o seguinte plano de ativação por etapas:

```text
Fase 1: Configurar TENANT_EXTENSION_MODE = LOG em homologação (validar falsos positivos/negativos)
   ↓
Fase 2: Configurar TENANT_EXTENSION_MODE = FILTER_READ (validar estabilidade de leituras)
   ↓
Fase 3: Refatorar as 22 queries vulneráveis validate-then-operate (substituir updates por updateMany)
   ↓
Fase 4: Configurar TENANT_EXTENSION_MODE = FULL (isolamento completo de leituras e escritas)
```

---

## 3. Navegação

* **[01. Visão Geral (01-overview.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/01-overview.md)**
* **[02. Auditoria e Dívida Técnica (02-query-audit.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/02-query-audit.md)**
* **[03. Matriz de Decisão e Classificação (03-decision-matrix.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/03-decision-matrix.md)**
* **04. Plano de Ativação e Feature Flags (Este documento)**
