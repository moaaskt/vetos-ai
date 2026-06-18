---
phase: 16B.1.1-aceite-e-assinatura-digital-do-tutor
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/consent-terms/consent-terms.controller.ts
  - backend/src/consent-terms/consent-terms.service.ts
  - backend/src/verification/verification.service.ts
  - frontend/src/pages/PublicDocumentView.tsx
  - frontend/src/components/print/PrintTermo.tsx
  - frontend/src/pages/PetDetails.tsx
autonomous: true
requirements: ["REQ-TUTOR-SIGN-DB", "REQ-TUTOR-SIGN-API", "REQ-TUTOR-SIGN-UI", "REQ-TIMELINE-UPDATE"]

must_haves:
  truths:
    - "O model ConsentTerm possui os novos campos de assinatura do tutor no Prisma schema."
    - "Existe um endpoint público para realizar a assinatura do tutor validando que o termo está no status SIGNED pela clínica."
    - "A página pública de visualização exibe o formulário de assinatura apenas para termos não assinados pelo tutor, e exibe as evidências de auditoria para os termos já assinados."
    - "O layout de impressão exibe as evidências de assinatura do tutor no rodapé do documento."
    - "A timeline no PetDetails exibe o status de termo assinado pelo tutor."
  artifacts:
    - path: "backend/prisma/schema.prisma"
      provides: "Esquema atualizado com campos de assinatura do tutor"
    - path: "backend/src/consent-terms/consent-terms.controller.ts"
      provides: "Endpoint público POST /consent-terms/:hash/tutor-sign exposto"
    - path: "frontend/src/pages/PublicDocumentView.tsx"
      provides: "Página pública com fluxo de aceite do tutor e exibição de auditoria"
---

<objective>
Implementar o fluxo completo de Aceite e Assinatura Digital do Tutor para Termos de Consentimento. Isso inclui a persistência das evidências de auditoria no banco de dados (Prisma), a criação do endpoint público no backend, o formulário de aceite na página pública do tutor e a atualização visual da timeline do prontuário do pet.

Purpose: Habilitar a validade legal do consentimento do tutor por meio de assinatura eletrônica (aceite estruturado com IP, CPF e data).
Output: Banco sincronizado, novas APIs no backend, frontend público com formulário e exibição de auditoria funcional, e timeline do veterinário atualizada.
</objective>

<execution_context>
@~/.gemini/antigravity/gsd-core/workflows/execute-plan.md
@~/.gemini/antigravity/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/16B.1.1-aceite-e-assinatura-digital-do-tutor/16B.1.1-CONTEXT.md
@.planning/phases/16B.1.1-aceite-e-assinatura-digital-do-tutor/16B.1.1-RESEARCH.md
@backend/prisma/schema.prisma
@backend/src/consent-terms/consent-terms.service.ts
@frontend/src/pages/PublicDocumentView.tsx
@frontend/src/components/print/PrintTermo.tsx
@frontend/src/pages/PetDetails.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Atualização do Banco de Dados [BLOCKING]</name>
  <read_first>backend/prisma/schema.prisma</read_first>
  <files>backend/prisma/schema.prisma</files>
  <action>
    Modificar o arquivo 'backend/prisma/schema.prisma' para adicionar os seguintes campos opcionais no model 'ConsentTerm':
    - `tutorSigned Boolean @default(false)`
    - `tutorSignedAt DateTime?`
    - `tutorSignatureName String?`
    - `tutorSignatureCpf String?`
    - `tutorSignatureIp String?`
    - `tutorSignatureUserAgent String?`

    Executar os testes de validação do Prisma:
    1. Executar `npx prisma validate` para checar sintaxe.
    2. Executar `npx prisma db push` para aplicar. 
    Se o Prisma solicitar perda de dados (data loss) ou reset/drop do banco de dados local, parar imediatamente e reportar ao usuário.
  </action>
  <verify>
    <automated>npx prisma validate</automated>
    <automated>npx prisma db push</automated>
  </verify>
  <acceptance_criteria>
    - O comando 'npx prisma validate' executa com sucesso.
    - O comando 'npx prisma db push' atualiza a base sem erros e sem requerer drop de dados.
  </acceptance_criteria>
  <done>Model ConsentTerm atualizado no banco de dados.</done>
</task>

<task type="auto">
  <name>Task 2: Endpoint de Assinatura e Atualização do Detalhamento do Documento</name>
  <read_first>backend/src/consent-terms/consent-terms.controller.ts</read_first>
  <files>
    backend/src/consent-terms/consent-terms.controller.ts
    backend/src/consent-terms/consent-terms.service.ts
    backend/src/verification/verification.service.ts
  </files>
  <action>
    1. No `ConsentTermsService`, implementar o método `tutorSign(hash: string, data: { name: string; cpf: string; ip: string; userAgent: string })`:
       - Buscar o termo pelo hash. Se não existir, lançar `NotFoundException`.
       - Validar que o termo está com o status `DocumentStatus.SIGNED` (assinatura da clínica realizada). Se estiver em `DRAFT`, lançar `BadRequestException`.
       - Validar se o termo já foi assinado pelo tutor (`tutorSigned === true`). Se sim, lançar `BadRequestException` para evitar re-assinaturas.
       - Atualizar o termo marcando `tutorSigned = true`, `tutorSignedAt = new Date()` e persistindo os dados de auditoria enviados.
    2. No `ConsentTermsController`, expor a rota pública (sem `@UseGuards(JwtAuthGuard)`):
       - `POST /consent-terms/public/:hash/tutor-sign`
       - Extrair `ip` e `userAgent` usando os decorators `@Ip() ip: string` (com fallback nos headers se vazio) e `@Headers('user-agent') userAgent: string`.
       - Receber no body `name: string` e `cpf: string` e chamar o service.
    3. No `VerificationService`, garantir que a busca do `GET /verify/:hash/details` retorne os novos campos do `ConsentTerm` (`tutorSigned`, `tutorSignedAt`, `tutorSignatureName`, `tutorSignatureCpf`, `tutorSignatureIp`, `tutorSignatureUserAgent`).
  </action>
  <verify>
    <automated>npm --prefix backend run test</automated>
  </verify>
  <acceptance_criteria>
    - Requisições públicas POST contendo CPF/Nome válidos preenchem os metadados e salvam com sucesso.
    - Tentativa de assinar termo inexistente, DRAFT ou já assinado pelo tutor falham com o código HTTP adequado (404/400).
    - O endpoint de detalhes público `/verify/:hash/details` expõe os dados de assinatura do tutor.
  </acceptance_criteria>
  <done>API pública de assinatura e verificação backend concluída.</done>
</task>

<task type="auto">
  <name>Task 3: Interface Pública de Assinatura e Bloco de Auditoria no Termo</name>
  <read_first>frontend/src/pages/PublicDocumentView.tsx</read_first>
  <files>
    frontend/src/pages/PublicDocumentView.tsx
    frontend/src/components/print/PrintTermo.tsx
  </files>
  <action>
    1. No `PublicDocumentView.tsx`, adicionar o fluxo de Aceite do Tutor se o documento for `TERMO_DE_CONSENTIMENTO` e `document.tutorSigned` for falso:
       - Renderizar um card contendo:
         - Checkbox de declaração de consentimento: "Declaro que li e concordo com os termos descritos acima."
         - Campo de Nome Completo.
         - Campo de CPF.
         - Botão "Aceitar e Assinar".
       - Implementar a chamada de POST à API `POST /consent-terms/public/:hash/tutor-sign`.
       - Exibir loading state durante a submissão e recarregar os dados do documento em caso de sucesso.
    2. Se `document.tutorSigned` for verdadeiro:
       - Ocultar o formulário.
       - Exibir o card de auditoria de assinatura eletrônica ao final do termo, com os campos Nome, CPF, IP, data e hora formatados em PT-BR.
    3. Atualizar o `PrintTermo.tsx` (componente de impressão do termo de consentimento) para renderizar o bloco de assinatura do tutor no final do documento quando `tutorSigned` for verdadeiro.
  </action>
  <verify>
    <automated>npm --prefix frontend run build</automated>
  </verify>
  <acceptance_criteria>
    - O frontend compila com sucesso sem erros de tipagem.
    - O formulário de aceite é exibido apenas para termos não assinados.
    - Os dados de auditoria aparecem na tela pública e no layout de impressão do termo.
  </acceptance_criteria>
  <done>Visualização pública e impressão de termos atualizados.</done>
</task>

<task type="auto">
  <name>Task 4: Atualização Visual da Timeline do Prontuário</name>
  <read_first>frontend/src/pages/PetDetails.tsx</read_first>
  <files>
    frontend/src/pages/PetDetails.tsx
  </files>
  <action>
    Modificar a timeline do prontuário em `frontend/src/pages/PetDetails.tsx`:
    - Localizar onde os itens do prontuário do tipo `TERMO_DE_CONSENTIMENTO` são listados.
    - Atualizar o status ou badge para diferenciar termos:
      - Termos em DRAFT.
      - Termos assinados apenas pela clínica (ex: "Registrado pela Clínica").
      - Termos que também receberam o aceite do tutor (ex: "✓ Assinado pelo Tutor").
  </action>
  <verify>
    <automated>npm --prefix frontend run build</automated>
  </verify>
  <acceptance_criteria>
    - A timeline do pet renderiza corretamente os status de assinatura do tutor.
    - O build do frontend continua passando com sucesso.
  </acceptance_criteria>
  <done>Timeline do prontuário clínico integrada com status de aceite do tutor.</done>
</task>

</tasks>

<threat_model>
## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16B.1.1-01| Elevation of Privilege | POST /consent-terms/public/:hash/tutor-sign | mitigate | Validar que o status do documento já é SIGNED pela clínica e que tutorSigned é falso antes de atualizar. |
| T-16B.1.1-02| Information Disclosure | POST /consent-terms/public/:hash/tutor-sign | mitigate | Limitar e sanitizar a entrada de dados (CPF, Nome) e capturar IP/User-Agent diretamente do request para auditoria confiável. |
</threat_model>

<verification>
Executar testes no backend e compilar o frontend:
`npm --prefix backend run test`
`npm --prefix frontend run build`
</verification>

<success_criteria>
- Banco de dados modificado com novos campos de aceite no ConsentTerm.
- Endpoint público de assinatura do tutor implementado e testado contra fraudes.
- Página pública do documento com formulário de aceite e bloco de auditoria visual de assinatura.
- Timeline clínica exibindo de forma clara o status do aceite do tutor.
</success_criteria>
