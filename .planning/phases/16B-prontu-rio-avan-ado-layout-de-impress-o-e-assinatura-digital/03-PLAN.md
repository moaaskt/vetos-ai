---
phase: 16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital
plan: "03"
type: execute
wave: 3
depends_on: ["02-PLAN.md"]
files_modified:
  - frontend/src/lib/api.ts
  - frontend/src/components/CreatePrescriptionModal.tsx
  - frontend/src/components/CreateConsentTermModal.tsx
  - frontend/src/pages/PetDetails.tsx
autonomous: true
requirements: ["REQ-01", "REQ-02", "REQ-03"]

must_haves:
  truths:
    - "O arquivo api.ts expõe os tipos Prescription, ConsentTemplate e ConsentTerm."
    - "A timeline clínica no PetDetails.tsx exibe receitas, termos e anexos de forma integrada e ordenada cronologicamente."
    - "Os modais de criação de Receita e Termo salvam os documentos em rascunho (DRAFT) com sucesso."
    - "O menu dropdown centralizado de ações de impressão oferece opções para Prontuário, Receita e Termo."
  artifacts:
    - path: "frontend/src/components/CreatePrescriptionModal.tsx"
      provides: "Formulário de criação de receitas médicas estruturadas/híbridas"
    - path: "frontend/src/components/CreateConsentTermModal.tsx"
      provides: "Formulário de seleção de template e edição de termo clínico"
  key_links:
    - from: "frontend/src/pages/PetDetails.tsx"
      to: "frontend/src/components/CreatePrescriptionModal.tsx"
      via: "Abertura do modal via estado local de controle"
    - from: "frontend/src/pages/PetDetails.tsx"
      to: "frontend/src/components/CreateConsentTermModal.tsx"
      via: "Abertura do modal via estado local de controle"
---

<objective>
Implementar no frontend os tipos no cliente HTTP, os formulários modais de criação para Receitas Médicas e Termos de Consentimento (incluindo renderização de templates), e atualizar a timeline clínica do Pet para incluir todos os novos tipos de registros ordenados de forma integrada.

Purpose: Habilitar o veterinário a criar receitas e termos na interface de atendimento e visualizá-los unificados no prontuário.
Output: api.ts atualizado, novos modais modulares de criação criados e integrados à timeline em PetDetails.tsx.
</objective>

<execution_context>
@~/.gemini/antigravity/gsd-core/workflows/execute-plan.md
@~/.gemini/antigravity/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital/16B-CONTEXT.md
@.planning/phases/16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital/16B-UI-SPEC.md
@frontend/src/lib/api.ts
@frontend/src/pages/PetDetails.tsx
@frontend/src/components/Modal.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Atualização das Tipagens e Integração dos Formulários Modais no Frontend</name>
  <read_first>
    frontend/src/lib/api.ts
    frontend/src/components/Modal.tsx
  </read_first>
  <files>
    frontend/src/lib/api.ts
    frontend/src/components/CreatePrescriptionModal.tsx
    frontend/src/components/CreateConsentTermModal.tsx
  </files>
  <action>
    1. Editar 'frontend/src/lib/api.ts' para exportar os novos tipos:
       - 'DocumentStatus': 'DRAFT' | 'SIGNED'
       - 'Prescription' (campos do modelo Prisma, incluindo 'verificationUrl' e 'verificationQrCode')
       - 'ConsentTemplate' (campos do modelo Prisma)
       - 'ConsentTerm' (campos do modelo Prisma, incluindo 'verificationUrl' e 'verificationQrCode')
       - Estender a interface 'Pet' para conter: 'prescriptions?: Prescription[]' e 'consentTerms?: ConsentTerm[]'.
    2. Criar o componente modular 'frontend/src/components/CreatePrescriptionModal.tsx' usando o modal reutilizável. O formulário deve ser híbrido (D-06):
       - Campos estruturados obrigatórios: medicamento, dosagem, frequencia, duracao, viaAdministracao.
       - Campo adicional: observacoes (textarea opcional).
       - Ao salvar, enviar 'POST /prescriptions' com 'status: DRAFT' e fechar o modal.
    3. Criar o componente modular 'frontend/src/components/CreateConsentTermModal.tsx'. Ao abrir:
       - Buscar a lista de templates via 'GET /consent-terms/templates'.
       - Permitir que o usuário selecione um template. Ao selecionar, substituir as variáveis do template base no frontend (ou via chamada backend) e exibir o resultado em um textarea para que o veterinário possa revisar e editar livremente (D-07).
       - Ao clicar em salvar, enviar 'POST /consent-terms' com 'finalText' editado e fechar o modal.
  </action>
  <verify>
    <automated>npm run build --prefix frontend</automated>
  </verify>
  <acceptance_criteria>
    - Os tipos 'Prescription', 'ConsentTemplate' e 'ConsentTerm' são reconhecidos e compilados sem erros pelo compilador TypeScript.
    - O modal de receita possui todos os 5 campos estruturados e o textarea de observações.
    - O modal de termo exibe a lista de templates carregados da API, preenche placeholders dinâmicos e permite edição livre do texto final.
  </acceptance_criteria>
  <done>Tipagens criadas e modais modulares de criação de documentos implementados com sucesso.</done>
</task>

<task type="auto">
  <name>Task 2: Timeline Unificada e Menu Centralizado de Impressão</name>
  <read_first>
    frontend/src/pages/PetDetails.tsx
  </read_first>
  <files>
    frontend/src/pages/PetDetails.tsx
  </files>
  <action>
    Editar o arquivo 'frontend/src/pages/PetDetails.tsx':
    1. Importar os modais 'CreatePrescriptionModal' e 'CreateConsentTermModal'. Declarar estados locais para controlá-los.
    2. Adicionar botões de ação rápida para "Nova Receita" e "Novo Termo" ao lado de "Registrar Evolução".
    3. Atualizar a geração do array 'timelineItems' para incorporar:
       - 'pet.prescriptions' como tipo 'PRESCRIPTION' (Exibir título "Receita Médica" e a lista de medicamentos formatada com ícone 💊).
       - 'pet.consentTerms' como tipo 'CONSENT_TERM' (Exibir título "Termo de Consentimento" com ícone 📄).
       - 'pet.clinicalAttachments' como tipo 'ATTACHMENT' (Exibir título "Anexo de Exame" com ícone 📎, integrado cronologicamente).
    4. Garantir que itens do tipo 'PRESCRIPTION' e 'CONSENT_TERM' possuam botões na timeline para visualização/impressão. Se o status for DRAFT, exibir um badge destacado "Rascunho" e um botão "Visualizar". Se for SIGNED, exibir um badge "Assinado" com o ícone de cadeado.
    5. Impedir a deleção de receitas ou termos que já estejam com status SIGNED.
    6. Criar um menu de ações dropdown no cabeçalho ou barra de ações do pet com as opções: "Imprimir prontuário completo", "Imprimir receita" (abre seletor se houver mais de uma) e "Imprimir termo" (abre seletor se houver mais de um).
  </action>
  <verify>
    <automated>npm run build --prefix frontend</automated>
  </verify>
  <acceptance_criteria>
    - O arquivo 'PetDetails.tsx' compila com sucesso.
    - Receitas e termos criados são exibidos na timeline do animal de forma integrada e cronologicamente ordenada com seus respectivos ícones/badges.
    - Documentos com status SIGNED não exibem botão de exclusão ou edição.
    - O dropdown de ações de impressão centralizado exibe as três opções recomendadas pela D-04.
  </acceptance_criteria>
  <done>Timeline unificada e menu de ações dropdown de impressão integrados no prontuário do PetDetails.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
- Client (Frontend SPA) → API (NestJS Backend): Interações via requests HTTP.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16B-06  | Elevation of Privilege | Form Submit | mitigate | Confiar na segurança do backend (multi-tenant guard) que valida a relação do Pet com a clínica antes de salvar. |
| T-16B-07  | Tampering | Timeline Actions | mitigate | Ocultar visualmente e bloquear no código do cliente chamadas de exclusão para qualquer documento assinado (status SIGNED). |
</threat_model>

<verification>
Verificar a integridade do código frontend compilando o bundle de desenvolvimento ou rodando verificação de tipos:
`npm run build` (ou comando equivalente no diretório frontend)
</verification>

<success_criteria>
- Os modais de criação funcionam perfeitamente e salvam rascunhos de receitas e termos no backend.
- A timeline exibe receitas e termos integrados de forma correta e estilizada de acordo com as especificações do UI-SPEC.
</success_criteria>

## Artifacts this phase produces
- `frontend/src/components/CreatePrescriptionModal.tsx` (componente do modal de receita).
- `frontend/src/components/CreateConsentTermModal.tsx` (componente do modal de termo).
- Modificações no `frontend/src/lib/api.ts` (novos tipos de dados expostos).
- Modificações no `frontend/src/pages/PetDetails.tsx` (timeline integrada, botões de ação e dropdown centralizado).
