# Prisma Query Audit & Technical Debt

Este documento apresenta o inventário completo do uso do Prisma Client em todo o backend, mapeia as exceções e destaca os riscos arquiteturais associados ao isolamento multi-tenant.

---

## 1. Estatísticas Consolidadas

| Métrica | Valor |
|---------|-------|
| **Total de queries Prisma** | ~154 |
| **Queries com `clinicId`** | 97 |
| **Queries globais / sem `clinicId`** | 57 |
| **Interactive Transactions (`$transaction`)** | 1 |
| **Raw Queries (`$queryRaw` / `$executeRaw`)** | 0 |

---

## 2. Dívida Técnica Conhecida (Known Technical Debt)

> [!WARNING]
> ### O Padrão Validate-then-Operate
> Atualmente existem **22 operações** no backend que dependem do padrão:
> ```text
> 1. Validar existência e posse do objeto principal (ex: Pet) filtrando por clinicId
> 2. Executar mutação (update/delete) do objeto dependente filtrando APENAS pelo ID primário
> ```
> Esse padrão é vulnerável se a chamada de validação (1) for modificada ou contornada. Na **Sprint 1.6**, todas as 22 queries deverão ser migradas para injeção explícita de `clinicId` na cláusula `where` usando as operações de lote do Prisma, que dispensam a validação prévia.

### Lista de Migrações Necessárias na Sprint 1.6:

1. **Clients Service**:
   * `client.update({ where: { id } })` (L104) → Converter para `updateMany({ where: { id, clinicId } })`
2. **Clinical Attachments Service**:
   * `clinicalAttachment.delete({ where: { id } })` (L137) → Converter para `deleteMany({ where: { id, clinicId } })`
3. **Consent Terms Service**:
   * `consentTerm.update({ where: { id } })` (L146, L165, L264, L298) → Converter para `updateMany({ where: { id, clinicId } })`
   * `consentTerm.delete({ where: { id } })` (L178) → Converter para `deleteMany({ where: { id, clinicId } })`
4. **Prescriptions Service**:
   * `prescription.update({ where: { id } })` (L87, L106, L205) → Converter para `updateMany({ where: { id, clinicId } })`
   * `prescription.delete({ where: { id } })` (L119) → Converter para `deleteMany({ where: { id, clinicId } })`
5. **Vaccines Service**:
   * `vaccineProtocolDose.deleteMany({ where: { protocolId } })` (L314) → Validar relação usando clinicId
   * `vaccineProtocol.update({ where: { id } })` (L320) → Converter para `updateMany({ where: { id, clinicId } })`
   * `vaccineProtocol.delete({ where: { id } })` (L351) → Converter para `deleteMany({ where: { id, clinicId } })`
   * `vaccineRecord.update({ where: { id } })` (L483, L530) → Converter para `updateMany({ where: { id, clinicId } })`

---

## 3. Blindagem de Transações Interativas ($transaction)

> [!CAUTION]
> ### Limitações de Interceptação do Prisma Extensions
> Em transações interativas (`prisma.$transaction(async (tx) => { ... })`), as chamadas de banco de dados executadas no cliente transacional local (`tx`) podem ignorar a interceptação global configurada na extensão se a propagação de contexto não for realizada corretamente.
> 
> * **Regra Arquitetural**: Toda nova transação interativa adicionada ao código do VetOS AI deve passar obrigatoriamente por revisão arquitetural de segurança.
> * **Caso Existente**: A única transação interativa está em [auth.service.ts](file:///home/moa-dev/projetos/vetos-ai/backend/src/auth/auth.service.ts#L56) e foi devidamente blindada e revisada (operação global de registro).

---

## 4. Navegação

* **[01. Visão Geral (01-overview.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/01-overview.md)**
* **02. Auditoria e Dívida Técnica (Este documento)**
* **[03. Matriz de Decisão e Classificação (03-decision-matrix.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/03-decision-matrix.md)**
* **[04. Plano de Ativação e Feature Flags (04-activation-plan.md)](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/tenant/04-activation-plan.md)**
