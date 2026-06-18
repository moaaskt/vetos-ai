---
phase: 16B.1-compartilhamento-de-documentos-com-tutor
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/notifications/notifications.processor.ts
  - backend/src/prescriptions/prescriptions.service.ts
  - backend/src/prescriptions/prescriptions.controller.ts
  - backend/src/consent-terms/consent-terms.service.ts
  - backend/src/consent-terms/consent-terms.controller.ts
  - backend/src/verification/verification.controller.ts
  - backend/src/verification/verification.service.ts
autonomous: true
requirements: ["REQ-DB-SCHEMA", "REQ-SHARE-RESTRICT", "REQ-SHARE-LOGS"]

must_haves:
  truths:
    - "O schema do Prisma foi atualizado com lastSharedAt nos modelos Prescription e ConsentTerm e FKs no NotificationLog."
    - "Apenas documentos clínicos com status SIGNED podem ser compartilhados com o tutor."
    - "O compartilhamento manual dispara notificações via BullMQ usando o NotificationsProcessor para e-mail ou WhatsApp."
    - "Os logs de compartilhamento são registrados no NotificationLog contendo o ID do documento de origem."
  artifacts:
    - path: "backend/prisma/schema.prisma"
      provides: "Esquema de banco de dados atualizado para auditoria de compartilhamento"
    - path: "backend/src/verification/verification.controller.ts"
      provides: "Endpoint público exposto para recuperar dados completos do documento assinado via hash"
  key_links:
    - from: "backend/src/prescriptions/prescriptions.controller.ts"
      to: "backend/src/notifications/notifications.processor.ts"
      via: "NotificationsService para enfileirar as notificações de envio"
---

<objective>
Modelar e sincronizar o banco de dados para suportar a auditoria de compartilhamento, criar os endpoints autenticados de disparo do compartilhamento de receitas e termos, e expor o endpoint público de visualização de detalhes do documento baseado em hash no backend.

Purpose: Garantir a segurança e rastreabilidade dos envios, bem como a entrega correta das informações do documento para a rota pública.
Output: Banco sincronizado, APIs de compartilhamento (/share) e API de detalhes (/verify/:hash/details) implementadas com testes unitários/integração válidos.
</objective>

<execution_context>
@~/.gemini/antigravity/gsd-core/workflows/execute-plan.md
@~/.gemini/antigravity/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/16B.1-compartilhamento-de-documentos-com-tutor/16B.1-CONTEXT.md
@.planning/phases/16B.1-compartilhamento-de-documentos-com-tutor/16B.1-RESEARCH.md
@backend/prisma/schema.prisma
@backend/src/notifications/notifications.processor.ts
@backend/src/prescriptions/prescriptions.service.ts
@backend/src/consent-terms/consent-terms.service.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Modelagem e Sincronização do Banco de Dados [BLOCKING]</name>
  <read_first>backend/prisma/schema.prisma</read_first>
  <files>backend/prisma/schema.prisma</files>
  <action>
    Atualizar o arquivo 'backend/prisma/schema.prisma' para adicionar suporte à rastreabilidade de compartilhamentos:
    1. No modelo 'Prescription', adicionar o campo opcional: `lastSharedAt DateTime?`.
    2. No modelo 'ConsentTerm', adicionar o campo opcional: `lastSharedAt DateTime?`.
    3. No modelo 'NotificationLog', adicionar os campos de chave estrangeira e relacionamentos opcionais:
       - `prescriptionId String?`
       - `consentTermId String?`
       - Relacionamento `prescription Prescription? @relation(fields: [prescriptionId], references: [id], onDelete: SetNull)`
       - Relacionamento `consentTerm ConsentTerm? @relation(fields: [consentTermId], references: [id], onDelete: SetNull)`
       - Adicionar índices: `@@index([prescriptionId])` e `@@index([consentTermId])`.
    4. Executar o schema push do Prisma para sincronizar o banco de dados.
  </action>
  <verify>
    <automated>npx prisma validate</automated>
    <automated>npx prisma db push --accept-data-loss</automated>
  </verify>
  <acceptance_criteria>
    - O comando 'npx prisma validate' executa com sucesso.
    - O comando 'npx prisma db push' atualiza a base de dados local sem falhas.
  </acceptance_criteria>
  <done>Banco de dados local sincronizado e atualizado.</done>
</task>

<task type="auto">
  <name>Task 2: Endpoints de Compartilhamento e Lógica de Envio (/share)</name>
  <read_first>backend/src/notifications/notifications.processor.ts</read_first>
  <files>
    backend/src/prescriptions/prescriptions.service.ts
    backend/src/prescriptions/prescriptions.controller.ts
    backend/src/consent-terms/consent-terms.service.ts
    backend/src/consent-terms/consent-terms.controller.ts
    backend/src/notifications/notifications.processor.ts
  </files>
  <action>
    1. Implementar o endpoint `POST /prescriptions/:id/share` no PrescriptionsController (protegido por JWT) e o método correspondente no PrescriptionsService:
       - Validar que a receita existe e pertence à clínica logada.
       - Validar se o status é SIGNED (se for DRAFT, lançar BadRequestException).
       - Obter os canais solicitados (EMAIL, WHATSAPP).
       - Disparar as notificações chamando o `NotificationsService.enqueueNotification` informando o `prescriptionId` e a mensagem de contexto.
       - Atualizar o campo `lastSharedAt` para o timestamp atual no banco de dados.
    2. Fazer o mesmo padrão para `POST /consent-terms/:id/share` no ConsentTermsController e no ConsentTermsService.
    3. Atualizar o `NotificationsProcessor` (em `backend/src/notifications/notifications.processor.ts`) para receber `prescriptionId` e `consentTermId` no payload e passar para o `NotificationLog` criado para auditoria completa.
  </action>
  <verify>
    <automated>npm --prefix backend run test</automated>
  </verify>
  <acceptance_criteria>
    - Tentativas de compartilhar documentos DRAFT falham com status 400.
    - O disparo de compartilhamento de documentos SIGNED atualiza `lastSharedAt` e gera registros no `NotificationLog`.
  </acceptance_criteria>
  <done>Endpoints e lógica de backend implementados e validados.</done>
</task>

<task type="auto">
  <name>Task 3: Novo Endpoint Público de Detalhes por Hash (/verify/:hash/details)</name>
  <read_first>backend/src/verification/verification.controller.ts</read_first>
  <files>
    backend/src/verification/verification.controller.ts
    backend/src/verification/verification.service.ts
  </files>
  <action>
    1. No `VerificationController`, expor a rota pública `GET /verify/:hash/details` (sem `JwtAuthGuard`).
    2. No `VerificationService`, implementar a busca baseada no hash do documento:
       - Tentar buscar em `Prescription` pelo `documentHash === hash`. Se encontrar, incluir relações de `Pet` (e seu Tutor/Client) e `Clinic`.
       - Se não encontrar, tentar buscar em `ConsentTerm` pelo `documentHash === hash`, incluindo relações de `Pet` (e seu Tutor) e `Clinic`.
       - Retornar o objeto de detalhes completo do documento. Se não encontrar em nenhum, lançar `NotFoundException`.
  </action>
  <verify>
    <automated>npm --prefix backend run test:e2e</automated>
  </verify>
  <acceptance_criteria>
    - Requisições para `GET /verify/:hash/details` com hash válido retornam o payload completo do documento (receita ou termo).
    - Requisições com hash inválido retornam status 404.
  </acceptance_criteria>
  <done>Endpoint público implementado.</done>
</task>

</tasks>

<threat_model>
## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16B.1-01| Elevation of Privilege | POST /share | mitigate | Validar o tenant (clinicId) do documento antes de enfileirar as notificações de compartilhamento. |
| T-16B.1-02| Information Disclosure | GET /verify/:hash/details | mitigate | Apenas retornar dados de documentos cujo status seja SIGNED, prevenindo vazamento de rascunhos (DRAFT). |
</threat_model>

<verification>
Executar testes unitários e de integração no backend:
`npm --prefix backend run test`
`npm --prefix backend run test:e2e`
</verification>

<success_criteria>
- Banco de dados sincronizado e schemas contendo chaves de auditoria.
- Endpoints de compartilhamento protegidos atualizando `lastSharedAt` pós-envio.
- Endpoint de verificação pública retornando detalhes apenas de documentos assinados.
</success_criteria>
