---
phase: 16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/prescriptions/prescriptions.module.ts
  - backend/src/prescriptions/prescriptions.controller.ts
  - backend/src/prescriptions/prescriptions.service.ts
  - backend/src/prescriptions/dto/create-prescription.dto.ts
  - backend/src/prescriptions/prescriptions.service.spec.ts
  - backend/src/consent-terms/consent-terms.module.ts
  - backend/src/consent-terms/consent-terms.controller.ts
  - backend/src/consent-terms/consent-terms.service.ts
  - backend/src/consent-terms/dto/create-consent-template.dto.ts
  - backend/src/consent-terms/dto/create-consent-term.dto.ts
  - backend/src/consent-terms/consent-terms.service.spec.ts
  - backend/src/app.module.ts
autonomous: true
requirements: ["REQ-01", "REQ-02", "REQ-03"]

must_haves:
  truths:
    - "O banco de dados possui as tabelas Prescription, ConsentTemplate e ConsentTerm."
    - "As APIs de receita e termo validam se o pet pertence à clínica logada."
    - "Documentos assinados (status SIGNED) tornam-se imutáveis e possuem um hash SHA-256 e QR code."
    - "A criação de um Termo de Consentimento substitui corretamente as variáveis dinâmicas do template base."
  artifacts:
    - path: "backend/prisma/schema.prisma"
      provides: "Estrutura relacional do banco de dados para os novos modelos"
    - path: "backend/src/prescriptions/prescriptions.service.ts"
      provides: "Lógica de negócio e criptografia de receitas médicas"
    - path: "backend/src/consent-terms/consent-terms.service.ts"
      provides: "Lógica de negócio e interpolação de termos de consentimento"
  key_links:
    - from: "backend/src/prescriptions/prescriptions.service.ts"
      to: "backend/prisma/schema.prisma"
      via: "Prisma client para persistência de receitas"
    - from: "backend/src/consent-terms/consent-terms.service.ts"
      to: "backend/prisma/schema.prisma"
      via: "Prisma client para persistência de termos e templates"
---

<objective>
Modelar o banco de dados e implementar os módulos backend para Receitas Médicas (Prescription) e Termos de Consentimento (ConsentTerm), incluindo regras de segurança multi-tenant, assinatura digital básica (geração de hash SHA-256 e QR code) e testes unitários.

Purpose: Garantir a persistência segura, isolamento por clínica e integridade criptográfica dos documentos clínicos emitidos.
Output: Esquema Prisma atualizado, banco sincronizado, APIs de receitas e termos criadas com cobertura de testes unitários.
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
@backend/src/clinical-records/clinical-records.service.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Modelagem e Sincronização do Banco de Dados [BLOCKING]</name>
  <read_first>backend/prisma/schema.prisma</read_first>
  <files>backend/prisma/schema.prisma</files>
  <action>
    Editar o arquivo 'backend/prisma/schema.prisma' para adicionar os seguintes modelos e enums:
    1. Enum 'DocumentStatus' com os valores: DRAFT, SIGNED (para uso em status de receitas e termos).
    2. Modelo 'Prescription' (Receita Médica) com:
       - id (String, UUID, @id)
       - medicamento, dosagem, frequencia, duracao, viaAdministracao (String)
       - observacoes (String, nullable)
       - status (DocumentStatus, padrão DRAFT)
       - documentHash, signedAt, verificationUrl (String/DateTime, nullable)
       - petId, clinicId (String, obrigatórios, chaves estrangeiras)
       - clinicalRecordId, appointmentId (String, nullable, chaves estrangeiras)
       - Relacionamentos: pet (Pet), clinic (Clinic), clinicalRecord (ClinicalRecord, optional), appointment (Appointment, optional)
    3. Modelo 'ConsentTemplate' (Template de Termo) com:
       - id (String, UUID, @id)
       - clinicId (String, obrigatório)
       - name, procedureType, baseText (String)
       - isActive (Boolean, padrão true)
       - Relacionamentos: clinic (Clinic)
    4. Modelo 'ConsentTerm' (Termo Clínico) com:
       - id (String, UUID, @id)
       - petId, clinicId (String, obrigatórios)
       - appointmentId (String, nullable)
       - consentTemplateId (String, nullable)
       - finalText (String)
       - status (DocumentStatus, padrão DRAFT)
       - documentHash, signedAt, verificationUrl (String/DateTime, nullable)
       - Relacionamentos: pet (Pet), clinic (Clinic), appointment (Appointment, optional), consentTemplate (ConsentTemplate, optional)
    5. Atualizar as relações nos modelos existentes (Clinic, Pet, ClinicalRecord, Appointment) correspondentes aos novos modelos.
    6. Executar o comando de push do Prisma para aplicar as alterações no banco de dados local.
  </action>
  <verify>
    <automated>npx prisma validate</automated>
    <automated>npx prisma db push --accept-data-loss</automated>
  </verify>
  <acceptance_criteria>
    - O comando 'npx prisma validate' executa com sucesso, indicando sintaxe correta.
    - O comando 'npx prisma db push' é concluído com êxito sem erros de integridade ou relacionamentos.
    - O arquivo 'backend/prisma/schema.prisma' contém os modelos 'Prescription', 'ConsentTemplate' e 'ConsentTerm'.
  </acceptance_criteria>
  <done>Banco de dados atualizado e sincronizado via schema push do Prisma.</done>
</task>

<task type="auto">
  <name>Task 2: Implementação do Módulo de Receitas Médicas (Prescription)</name>
  <read_first>backend/src/clinical-records/clinical-records.service.ts</read_first>
  <files>
    backend/package.json
    backend/src/prescriptions/dto/create-prescription.dto.ts
    backend/src/prescriptions/prescriptions.service.ts
    backend/src/prescriptions/prescriptions.controller.ts
    backend/src/prescriptions/prescriptions.module.ts
    backend/src/prescriptions/prescriptions.service.spec.ts
    backend/src/app.module.ts
  </files>
  <action>
    1. Instalar as dependências de QR code no backend executando 'npm install qrcode' e 'npm install --save-dev @types/qrcode'.
    2. Criar a estrutura do módulo de receitas sob a pasta 'backend/src/prescriptions/':
       - DTO para criação da receita contendo os campos obrigatórios (medicamento, dosagem, frequencia, duracao, viaAdministracao, petId) e opcionais (observacoes, clinicalRecordId, appointmentId).
       - Controller que protege todas as rotas com 'JwtAuthGuard' e injeta '@CurrentUser()'. Endpoints: 'POST /prescriptions' (criar DRAFT), 'GET /prescriptions/:id' (obter detalhes), 'POST /prescriptions/:id/sign' (assinar documento).
       - Service que valida se o 'petId' pertence à clínica logada ('clinicId' do usuário). No endpoint de assinatura '/:id/sign', buscar a receita, ordenar as chaves do payload (id, petId, clinicId, medicamento, dosagem, frequencia, duracao, viaAdministracao, data do servidor), gerar o hash SHA-256 usando o módulo nativo 'crypto', converter a URL pública de verificação '/verify/{hash}' em um QR code base64 usando a biblioteca 'qrcode', atualizar o status para SIGNED, a data signedAt e salvar. Adicionar validações estritas de imutabilidade que bloqueiam edição e deleção após o status ser SIGNED.
    3. Criar os testes unitários em 'prescriptions.service.spec.ts' cobrindo a validação de pertença do Pet (REQ-01) e a consistência/geração de hash e bloqueio de edição de assinados (REQ-02).
    4. Registrar 'PrescriptionsModule' no 'backend/src/app.module.ts'.
  </action>
  <verify>
    <automated>npm run test -- prescriptions.service.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - Os pacotes 'qrcode' e '@types/qrcode' estão instalados e listados no 'package.json'.
    - Os testes unitários em 'prescriptions.service.spec.ts' passam sem erros.
    - Chamar a criação de receita com um 'petId' pertencente a outra clínica retorna erro 404/403.
    - A assinatura do documento gera um hash SHA-256 de 64 caracteres e uma string base64 válida na propriedade 'verificationUrl' (QR Code).
    - Tentativas de editar ou assinar novamente uma receita com status SIGNED retornam erro 400 Bad Request.
  </acceptance_criteria>
  <done>Módulo de receitas implementado no backend com controle de acesso, imutabilidade criptográfica e testes unitários validados.</done>
</task>

<task type="auto">
  <name>Task 3: Implementação do Módulo de Termos de Consentimento (ConsentTerm)</name>
  <read_first>backend/src/clinical-records/clinical-records.service.ts</read_first>
  <files>
    backend/src/consent-terms/dto/create-consent-template.dto.ts
    backend/src/consent-terms/dto/create-consent-term.dto.ts
    backend/src/consent-terms/consent-terms.service.ts
    backend/src/consent-terms/consent-terms.controller.ts
    backend/src/consent-terms/consent-terms.module.ts
    backend/src/consent-terms/consent-terms.service.spec.ts
    backend/src/app.module.ts
  </files>
  <action>
    1. Criar a estrutura do módulo de termos sob 'backend/src/consent-terms/':
       - DTO para criação de templates (name, procedureType, baseText).
       - DTO para criação de termos (petId, appointmentId, consentTemplateId, finalText).
       - Controller protegido por JwtAuthGuard com endpoints: 'GET /consent-terms/templates' (listar templates), 'POST /consent-terms/templates' (criar template), 'POST /consent-terms' (criar DRAFT a partir do template resolvido), 'POST /consent-terms/:id/sign' (assinar termo).
       - Service que implementa a listagem e criação de templates. Se a listagem de templates de uma clínica retornar vazia, inicializar/sinalizar dinamicamente os 3 templates padrão (Castração, Cirurgia Eletiva, Internação) contendo as chaves '{pet_name}', '{tutor_name}' e '{clinic_name}'.
       - No método de criação de termo: Buscar o template, obter os dados do Pet, Tutor (Client) e Clínica para substituir os placeholders dinamicamente no 'baseText' do template, gerando o 'finalText' padrão que pode ser revisado e editado. Validar a pertença do Pet à clínica.
       - No método de assinatura '/:id/sign': Calcular hash SHA-256 a partir do 'finalText' e metadados, gerar o QR code base64 para '/verify/{hash}', alterar status para SIGNED e aplicar regras de imutabilidade similares às de receitas.
    2. Criar os testes unitários em 'consent-terms.service.spec.ts' cobrindo a substituição de placeholders (REQ-03), validação de segurança de tenant e bloqueio de edição pós-assinatura.
    3. Registrar 'ConsentTermsModule' no 'backend/src/app.module.ts'.
  </action>
  <verify>
    <automated>npm run test -- consent-terms.service.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - Os testes unitários em 'consent-terms.service.spec.ts' passam com sucesso.
    - A criação de termo interpola corretamente '{pet_name}' pelo nome do animal, '{tutor_name}' pelo nome do tutor e '{clinic_name}' pelo nome da clínica no texto final gerado.
    - A assinatura do termo gera o hash SHA-256 e o QR Code de verificação, tornando o documento imutável.
    - A listagem de templates auto-popula a clínica com os 3 modelos padrão (Castração, Cirurgia Eletiva, Internação) caso nenhum exista previamente.
  </acceptance_criteria>
  <done>Módulo de termos de consentimento e templates criado no backend com substituição dinâmica de placeholders e testes verdes.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
- Client (Frontend SPA) → API (NestJS Backend): Comunicação sobre HTTP, dados não confiáveis são enviados no payload do documento.
- Public User (Browser/Mobile QR Code scanner) → API (NestJS Backend): Rota pública de consulta sem token JWT.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16B-01  | Elevation of Privilege | GET/POST /prescriptions | mitigate | Validar no NestJS se o 'petId' informado pertence à clínica logada ('clinicId' do token do usuário). |
| T-16B-02  | Tampering | POST /prescriptions/:id/sign | mitigate | Uma vez assinado (status SIGNED), rejeitar qualquer tentativa de UPDATE/DELETE ou novas assinaturas do mesmo registro. |
| T-16B-03  | Information Disclosure | GET /verify/:hash | mitigate | Retornar metadados básicos apenas (tipo do documento, clínica, pet, data de assinatura, veredito de validade) sem expor o conteúdo sensível (medicamentos, dosagem, observações ou finalText). |
| T-16B-SC  | Tampering | npm packages | mitigate | Utilizar apenas pacotes auditados e estáveis ('qrcode' verificado no registry oficial). |
</threat_model>

<verification>
Após a execução de todas as tarefas do plano, executar a suite de testes unitários do backend para comprovar o funcionamento e a integridade de todas as regras de negócio:
`npm run test -- prescriptions.service.spec.ts`
`npm run test -- consent-terms.service.spec.ts`
</verification>

<success_criteria>
- Banco de dados relacional contém as tabelas atualizadas para receitas, templates e termos.
- Módulos backend de receitas e termos operam sem erros, aplicando regras de imutabilidade criptográfica ao assinar.
- A cobertura de testes unitários garante a ausência de regressões e valida as restrições multi-tenant.
</success_criteria>

## Artifacts this phase produces
- `backend/prisma/schema.prisma` (modificações para novos modelos: `Prescription`, `ConsentTemplate`, `ConsentTerm` e `DocumentStatus` enum).
- `backend/src/prescriptions/prescriptions.module.ts` (módulo principal de receitas).
- `backend/src/prescriptions/prescriptions.controller.ts` (controller de endpoints protegidos por JWT).
- `backend/src/prescriptions/prescriptions.service.ts` (lógica de negócios, multi-tenancy, SHA-256 e geração de QR code).
- `backend/src/prescriptions/dto/create-prescription.dto.ts` (validação de payload de entrada).
- `backend/src/prescriptions/prescriptions.service.spec.ts` (suite de testes para REQ-01 e REQ-02).
- `backend/src/consent-terms/consent-terms.module.ts` (módulo de templates e termos de consentimento).
- `backend/src/consent-terms/consent-terms.controller.ts` (controller com endpoints protegidos por JWT).
- `backend/src/consent-terms/consent-terms.service.ts` (lógica de templates, interpolação, SHA-256 e geração de QR code).
- `backend/src/consent-terms/dto/create-consent-template.dto.ts` (validação de dados de template).
- `backend/src/consent-terms/dto/create-consent-term.dto.ts` (validação de dados do termo finalizado).
- `backend/src/consent-terms/consent-terms.service.spec.ts` (suite de testes para REQ-03).
