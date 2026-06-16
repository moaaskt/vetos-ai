# Phase 16B: Prontuário Avançado, Layout de Impressão e Assinatura Digital - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Elevar o nível de conformidade legal do prontuário veterinário implementando:
1. Layout limpo e responsivo para impressão física/PDF de prontuários clínicos, receitas médicas e termos de consentimento — via print dialog nativo do browser com preview em modal fullscreen.
2. Modelos de dados dedicados para `Prescription` (receita médica) e `ConsentTerm` (termo de consentimento) com `ConsentTemplate` reutilizável por clínica.
3. Estrutura de assinatura digital própria (sem ICP-Brasil nesta fase): hash SHA-256 + timestamp do servidor + QR code de verificação apontando para endpoint público `/verify/:hash`.

</domain>

<decisions>
## Implementation Decisions

### Geração de PDF / Layout de Impressão
- **D-01:** Usar o print dialog nativo do browser (`window.print()`) como estratégia de geração de PDF/impressão. Evitar Puppeteer/Playwright no backend por peso excessivo para este MVP.
- **D-02:** Criar componentes de layout de impressão isolados (ex: `PrintProntuario.tsx`, `PrintReceita.tsx`, `PrintTermo.tsx`) renderizados dentro de um **modal fullscreen** ou aba dedicada. O usuário clica "Imprimir/Visualizar" e vê o preview antes de chamar `window.print()`.
- **D-03:** A estrutura visual dos documentos impressos deve conter obrigatoriamente:
  - **Cabeçalho:** logo da clínica + nome + endereço
  - **Dados do paciente:** nome do pet, espécie, raça, nome do tutor
  - **Corpo do documento:** conteúdo específico por tipo (prontuário, receita ou termo)
  - **Rodapé:** data de emissão + campo de assinatura do veterinário + QR code de verificação (quando assinado)
- **D-04:** O ponto de entrada para impressão é um **menu de ações (dropdown)** no `PetDetails.tsx` com as opções: "Imprimir prontuário completo" / "Imprimir receita" / "Imprimir termo" — centralizado e não fragmentado por documento.

### Documentos Cobertos
- **D-05:** Esta fase cobre três tipos de documento com layout de impressão:
  - Prontuário Clínico (consolidado do histórico do pet)
  - Receita Médica (`Prescription`)
  - Termo de Consentimento (`ConsentTerm`)
- **D-06:** **Formato da Receita Médica** — híbrido com campos estruturados + texto livre:
  - Campos estruturados obrigatórios: `medicamento`, `dosagem`, `frequencia`, `duracao`, `viaAdministracao`
  - Campo adicional: `observacoes` (texto livre para orientações específicas do veterinário)
- **D-07:** **Formato do Termo de Consentimento** — baseado em templates editáveis:
  - A clínica possui templates (`ConsentTemplate`) por tipo de procedimento (castração, cirurgia, internação, etc.)
  - Ao criar um termo, o sistema preenche automaticamente dados do tutor/pet/clínica no texto base do template
  - O veterinário pode revisar e editar livremente antes de salvar/imprimir
  - O `ConsentTerm` armazena o **texto final renderizado/editado** para preservar o histórico mesmo que o template seja alterado depois

### Visibilidade na Timeline
- **D-08:** Receitas e termos aparecem **integrados à timeline clínica** do `PetDetails.tsx` junto com notas clínicas, procedimentos e anexos (Fase 16A), diferenciados visualmente por tipo com ícones/badges:
  - 📝 Nota Clínica
  - 💊 Receita Médica
  - 📄 Termo de Consentimento
  - 📎 Anexo de Exame
- **D-09:** Filtros por tipo (`Todos / Notas / Procedimentos / Receitas / Termos / Anexos`) ficam **deferidos** — a arquitetura deve comportar isso no futuro sem mudança estrutural.

### Modelo de Dados Prisma — Prescription
- **D-10:** Criar modelo `Prescription` com:
  - Vínculos **obrigatórios:** `petId`, `clinicId`
  - Vínculos **opcionais e independentes:** `clinicalRecordId` (nullable), `appointmentId` (nullable)
  - Campos de conteúdo: `medicamento`, `dosagem`, `frequencia`, `duracao`, `viaAdministracao`, `observacoes` (nullable)
  - Campos de assinatura: `status` (enum: `DRAFT | SIGNED`), `documentHash` (nullable), `signedAt` (nullable), `verificationUrl` (nullable)
  - Campos padrão: `id`, `createdAt`, `updatedAt`

### Modelo de Dados Prisma — ConsentTemplate
- **D-11:** Criar modelo `ConsentTemplate` vinculado à `Clinic`:
  - `id`, `clinicId`, `name`, `procedureType`, `baseText`, `isActive` (Boolean), `createdAt`, `updatedAt`
  - Permite CRUD de templates por clínica (preparação para biblioteca de termos no SaaS)

### Modelo de Dados Prisma — ConsentTerm
- **D-12:** Criar modelo `ConsentTerm` com:
  - Vínculos **obrigatórios:** `petId`, `clinicId`
  - Vínculo **opcional:** `appointmentId` (nullable) — um termo pode existir sem consulta agendada
  - Referência ao template de origem: `consentTemplateId` (nullable — permite termos sem template)
  - Campo de conteúdo: `finalText` (String — texto final editado pelo veterinário, preservado mesmo que o template mude)
  - Campos de assinatura: `status` (enum: `DRAFT | SIGNED`), `documentHash` (nullable), `signedAt` (nullable), `verificationUrl` (nullable)
  - Campos padrão: `id`, `createdAt`, `updatedAt`

### Assinatura Digital — Mecanismo de Integridade
- **D-13:** Mecanismo de verificação de integridade: **hash SHA-256** do conteúdo final do documento + timestamp do servidor + `clinicId`. O QR code exibido no documento impresso aponta para `/verify/:hash`.
- **D-14:** Endpoint público `GET /verify/:hash` no backend NestJS retorna dados básicos do documento (tipo, pet, clínica, data de assinatura, status `SIGNED`) — **sem expor o conteúdo completo** do documento.
- **D-15:** **Fluxo de assinatura** na UI:
  1. Veterinário cria/edita o documento
  2. Clica em "Visualizar" → abre modal de preview de impressão
  3. Revisa o documento final
  4. Clica em "Assinar documento"
  5. Sistema gera: hash SHA-256 + timestamp + ID do documento + QR code de verificação
  6. Documento passa para status `SIGNED` e torna-se **imutável**
  7. PDF final exibe QR code, hash abreviado e dados de assinatura no rodapé
- **D-16:** Regras de imutabilidade:
  - Apenas documentos `SIGNED` podem ser impressos como versão oficial
  - Após assinado, **nenhuma edição é permitida**
  - Para corrigir: criar nova versão do documento (novo registro `DRAFT`)
  - A assinatura **não é automática** ao imprimir — requer ação explícita do usuário

### the agent's Discretion
- Nomenclatura exata das rotas REST no backend (ex: `POST /pets/:petId/prescriptions`, `POST /pets/:petId/consent-terms`).
- Biblioteca de geração de QR code no backend (ex: `qrcode` npm package).
- Estilos CSS `@media print` dos componentes de impressão — cores, margens, fontes (respeitando tema OKLCH do projeto).
- Estratégia de seed de `ConsentTemplate` padrões (ex: 3 templates iniciais: castração, cirurgia eletiva, internação).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planejamento e Roadmap
- `.planning/ROADMAP.md` — Definição da Fase 16B e dependências (depende de 16A).
- `.planning/STATE.md` — Estado atual do projeto e fases completadas.

### Fase Anterior (dependência obrigatória)
- `.planning/phases/16A-uploads-de-exames-e-anexos-cl-nicos/16A-CONTEXT.md` — Decisões de arquitetura de storage, modelo `ClinicalAttachment`, padrão de isolamento multi-tenant (LEITURA OBRIGATÓRIA).
- `.planning/phases/16A-uploads-de-exames-e-anexos-cl-nicos/16A-PLAN.md` — Implementação já executada da Fase 16A.

### Banco de Dados (Prisma Schema)
- `backend/prisma/schema.prisma` — Modelos existentes: `Clinic`, `Pet`, `ClinicalRecord` (com enum `ClinicalRecordType`), `ClinicalAttachment`, `Appointment`. Os novos modelos `Prescription`, `ConsentTemplate`, `ConsentTerm` serão adicionados aqui.

### Lógica de Negócios (Backend)
- `backend/src/clinical-records/clinical-records.service.ts` — Padrão de validação `clinicId` a ser replicado nos novos módulos.
- `backend/src/clinical-attachments/` — Padrão de módulo com isolamento multi-tenant para anexos (replicar para receitas e termos).

### Interface de Usuário (Frontend)
- `frontend/src/pages/PetDetails.tsx` — Painel central onde a timeline clínica, as abas e o menu de ações de impressão serão integrados.
- `frontend/src/index.css` — Paleta OKLCH Light/Dark para garantir consistência visual nos novos componentes.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/pages/PetDetails.tsx`: painel tabulado existente com timeline clínica e aba "Exames e Anexos" — **ponto central de integração** para a timeline unificada (D-08).
- `frontend/src/components/Modal.tsx`: componente de modal reutilizável — base para o **modal fullscreen de preview de impressão**.
- `backend/src/storage/`: `StorageService` e `LocalStorageService` — abstração de storage já em produção; pode ser reutilizada para salvar PDFs gerados futuramente.
- `backend/src/clinical-attachments/`: módulo completo com controller + service + DTO + validação multi-tenant — **template arquitetural** para os novos módulos de `Prescription` e `ConsentTerm`.

### Established Patterns
- Guards `JwtAuthGuard` + `@CurrentUser()` com validação de `clinicId` em todos os endpoints — **OBRIGATÓRIO** nos novos módulos de receita e termo.
- Validação de pertença do `Pet` à clínica antes de qualquer operação (padrão do `clinical-records.service.ts`) — replicar em `PrescriptionService` e `ConsentTermService`.
- Enum `ClinicalRecordType` (NOTE | PROCEDURE) no Prisma — não reutilizar para os novos tipos; criar modelos separados conforme D-10, D-11, D-12.

### Integration Points
- **Timeline do `PetDetails.tsx`**: merge de `pet.appointments`, `pet.clinicalRecords` e `pet.clinicalAttachments` (16A) — agora também `pet.prescriptions` e `pet.consentTerms`.
- **Menu de ações no `PetDetails.tsx`**: novo dropdown "Imprimir" com três opções (D-04).
- **Endpoint `/verify/:hash`**: rota pública (sem autenticação) no backend NestJS para verificação de integridade de documentos assinados.

</code_context>

<specifics>
## Specific Ideas

- O veterinário não pode editar um documento após status `SIGNED`. Para corrigir um documento assinado, o sistema deve criar automaticamente uma nova versão (`DRAFT`) e invalidar a anterior (ou apenas criar nova sem remover a antiga).
- Seed inicial de `ConsentTemplate` com pelo menos 3 templates padrão (castração, cirurgia eletiva, internação) para que a clínica já tenha ponto de partida.
- O QR code exibido no documento impresso deve ser gerado server-side (backend NestJS com pacote `qrcode`) e retornado como data URI ou salvo como arquivo estático acessível publicamente.
- O hash SHA-256 deve ser calculado a partir do conteúdo final **imutável** do documento (após última edição), **nunca antes** do usuário revisar o preview.

</specifics>

<deferred>
## Deferred Ideas

- **Integração real com ICP-Brasil / Clicksign / BirdSign**: assinatura qualificada por certificado digital — fase futura após estrutura base desta fase estar em produção.
- **Filtros por tipo na timeline**: Todos / Notas / Procedimentos / Receitas / Termos / Anexos — a arquitetura deve suportar, mas a implementação de UI fica para fase posterior.
- **Biblioteca de templates de termos por clínica (CRUD completo no frontend)**: o backend e o modelo `ConsentTemplate` serão criados nesta fase, mas um painel admin de gerenciamento de templates é escopo futuro.
- **Download em lote de documentos**: zip com todos os registros do pet — escopo de fase futura.
- **Timestamp externo em blockchain**: âncora de imutabilidade via serviço externo — out of scope nesta fase.

</deferred>

---

*Phase: 16B-Prontuário Avançado, Layout de Impressão e Assinatura Digital*
*Context gathered: 2026-06-16*
