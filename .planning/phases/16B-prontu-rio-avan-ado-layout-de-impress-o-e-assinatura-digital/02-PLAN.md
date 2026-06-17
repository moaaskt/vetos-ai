---
phase: 16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital
plan: "02"
type: execute
wave: 2
depends_on: ["01-PLAN.md"]
files_modified:
  - backend/src/verification/verification.module.ts
  - backend/src/verification/verification.controller.ts
  - backend/src/verification/verification.controller.spec.ts
  - backend/src/pets/pets.service.ts
  - backend/src/app.module.ts
autonomous: true
requirements: ["REQ-04"]

must_haves:
  truths:
    - "A rota GET /verify/:hash é pública, sem autenticação JWT."
    - "A rota GET /verify/:hash busca em receitas e termos de consentimento assinados pelo hash informado."
    - "A rota GET /verify/:hash retorna apenas metadados do documento assinado e nunca expõe o conteúdo clínico."
    - "O serviço de detalhes do pet retorna as receitas e termos de consentimento associados ao animal."
  artifacts:
    - path: "backend/src/verification/verification.controller.ts"
      provides: "Endpoint público NestJS de validação jurídica"
    - path: "backend/src/pets/pets.service.ts"
      provides: "Inclusão de receitas e termos na query do pet"
  key_links:
    - from: "backend/src/verification/verification.controller.ts"
      to: "backend/prisma/schema.prisma"
      via: "Busca de hashes nas tabelas Prescription e ConsentTerm"
---

<objective>
Implementar a rota pública de verificação de documentos assinados via hash SHA-256 e integrar receitas e termos ao feed de dados do pet no backend.

Purpose: Permitir a verificação online de integridade de documentos impressos via QR Code de forma segura e expor receitas/termos para a timeline.
Output: VerificationModule funcionando com testes de integridade e pets.service.ts atualizado.
</objective>

<execution_context>
@~/.gemini/antigravity/gsd-core/workflows/execute-plan.md
@~/.gemini/antigravity/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital/16B-CONTEXT.md
@.planning/phases/16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital/16B-RESEARCH.md
@backend/prisma/schema.prisma
@backend/src/pets/pets.service.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Criação do Módulo de Verificação Pública (VerificationModule)</name>
  <read_first>
    backend/src/auth/jwt-auth.guard.ts
    backend/prisma/schema.prisma
  </read_first>
  <files>
    backend/src/verification/verification.module.ts
    backend/src/verification/verification.controller.ts
    backend/src/verification/verification.controller.spec.ts
    backend/src/app.module.ts
  </files>
  <action>
    1. Criar o módulo público 'VerificationModule' sob a pasta 'backend/src/verification/':
       - Controller 'VerificationController' com endpoint 'GET /verify/:hash'.
       - **IMPORTANTE:** Este controller NÃO deve conter o decorator @UseGuards(JwtAuthGuard) no nível da classe para permitir acesso público irrestrito.
       - A lógica deve buscar um registro correspondente ao hash na tabela 'Prescription' (filtrando por status = SIGNED). Se encontrado, retornar: verified: true, documentType: 'RECEITA_MEDICA', clinicName, petName, signedAt, status: 'SIGNED'.
       - Se não encontrado em receitas, buscar na tabela 'ConsentTerm' (status = SIGNED). Se encontrado, retornar: verified: true, documentType: 'TERMO_DE_CONSENTIMENTO', clinicName, petName, signedAt, status: 'SIGNED'.
       - Se não encontrado em nenhum dos dois, disparar NotFoundException('Documento não encontrado ou inválido.').
       - **CRITICAL:** Em nenhuma hipótese retornar campos de texto clínico (como medicamento, dosagem ou finalText) para evitar vazamento de dados (Information Disclosure).
    2. Criar testes unitários em 'verification.controller.spec.ts' cobrindo os cenários: hash de receita válido (REQ-04), hash de termo válido (REQ-04), hash inválido (retorna 404), e certificar de que dados privados não são vazados na resposta.
    3. Registrar o 'VerificationModule' no 'backend/src/app.module.ts'.
  </action>
  <verify>
    <automated>npm run test -- verification.controller.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - Os testes unitários em 'verification.controller.spec.ts' passam sem erros.
    - Requisições a '/verify/{hash}' com hash assinado de receita existente retornam veredito de validade e o nome do pet/clínica, mas não revelam os medicamentos prescritos.
    - Requisições a '/verify/{hash}' com hash inválido ou inexistente retornam status 404.
  </acceptance_criteria>
  <done>Módulo de verificação pública implementado no backend com controle de exposição de dados e testes unitários verdes.</done>
</task>

<task type="auto">
  <name>Task 2: Inclusão de Receitas e Termos nos Dados de Detalhes do Pet</name>
  <read_first>
    backend/src/pets/pets.service.ts
  </read_first>
  <files>
    backend/src/pets/pets.service.ts
  </files>
  <action>
    Editar o arquivo 'backend/src/pets/pets.service.ts' no método responsável por retornar o prontuário completo ou detalhes do pet.
    1. Incluir no 'select' ou 'include' do Prisma Client as relações 'prescriptions' e 'consentTerms'.
    2. Garantir que as receitas e termos sejam retornados ordenados por data ou em formato estruturado adequado para consumo do frontend.
  </action>
  <verify>
    <automated>npm run test -- pets.service.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - A consulta do Prisma no service do Pet inclui os novos campos 'prescriptions' e 'consentTerms'.
    - Os testes existentes para o módulo de pets continuam passando sem regressões.
  </acceptance_criteria>
  <done>O service de pets no backend foi atualizado para expor receitas e termos clínicos do animal.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
- Public User (Browser/Mobile QR Code scanner) → API (NestJS Backend): Rota pública de consulta sem token JWT.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16B-04  | Information Disclosure | GET /verify/:hash | mitigate | O endpoint público de verificação retorna apenas metadados sem revelar o conteúdo dos exames, receitas ou termos clínicos. |
| T-16B-05  | Denial of Service | GET /verify/:hash | mitigate | Confiar na infraestrutura existente; a rota é simples e realiza buscas otimizadas indexadas por hash SHA-256 no banco de dados. |
</threat_model>

<verification>
Executar a suite de testes unitários do controller de verificação para comprovar o funcionamento da rota:
`npm run test -- verification.controller.spec.ts`
</verification>

<success_criteria>
- A rota '/verify/:hash' responde publicamente e retorna os metadados de receitas e termos assinados sem revelar informações clínicas.
- Os detalhes do prontuário do pet contêm o histórico de receitas e termos.
</success_criteria>

## Artifacts this phase produces
- `backend/src/verification/verification.module.ts` (módulo de verificação).
- `backend/src/verification/verification.controller.ts` (controller público de verificação).
- `backend/src/verification/verification.controller.spec.ts` (suite de testes para REQ-04).
