---
phase: 16B.1-compartilhamento-de-documentos-com-tutor
plan: "02"
type: execute
wave: 2
depends_on: ["01"]
files_modified:
  - frontend/src/routes.tsx
  - frontend/src/pages/PublicDocumentView.tsx
  - frontend/src/components/ShareDocumentModal.tsx
  - frontend/src/pages/PetDetails.tsx
  - frontend/src/components/PrintPreviewModal.tsx
autonomous: true
requirements: ["REQ-PUBLIC-VIEW", "REQ-UI-SELECT"]

must_haves:
  truths:
    - "A rota pública /documento/:hash exibe o documento formatado sem sidebar/navbar do app."
    - "O modal de compartilhamento lê dinamicamente email/telefone e desabilita checkboxes indisponíveis."
    - "O botão de compartilhamento está presente no preview de impressão e na timeline para documentos assinados."
  artifacts:
    - path: "frontend/src/pages/PublicDocumentView.tsx"
      provides: "Visualização pública standalone do documento com layout de impressão reutilizado"
    - path: "frontend/src/components/ShareDocumentModal.tsx"
      provides: "Interface de seleção de canais de envio (e-mail, WhatsApp) com dados do tutor"
---

<objective>
Implementar o fluxo de interface do usuário (UI) para compartilhamento manual a partir do prontuário e do modal de preview, e desenvolver a página pública de visualização standalone do documento clínico para acesso sem autenticação pelo tutor.

Purpose: Facilitar a experiência do veterinário no envio e permitir ao tutor visualizar/imprimir o documento com qualidade em qualquer dispositivo.
Output: Componentes de UI do modal de envio, botões integrados, rota pública no React Router implementada e perfeitamente estilizada.
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
@frontend/src/pages/PetDetails.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Página Standalone de Visualização Pública (/documento/:hash)</name>
  <read_first>frontend/src/pages/PetDetails.tsx</read_first>
  <files>
    frontend/src/routes.tsx
    frontend/src/pages/PublicDocumentView.tsx
  </files>
  <action>
    1. Criar o componente `PublicDocumentView.tsx` em `frontend/src/pages/`:
       - Buscar os detalhes do documento via `fetch` ou `axios` chamando o endpoint `/verify/:hash/details` usando o hash de `useParams()`.
       - Exibir loading states adequados e tratamento de erros (ex: "Link expirado ou documento inválido").
       - Renderizar o layout de impressão correspondente ao tipo de documento (receita ou termo de consentimento) reutilizando as propriedades e o estilo visual dos componentes já existentes (`PrintReceita.tsx`, `PrintTermo.tsx`).
       - Incluir um botão discreto de topo: "Imprimir Documento" que invoca `window.print()`.
       - Aplicar CSS customizado para ocultar o botão de topo e as barras do navegador no momento da impressão física.
    2. Registrar a rota pública `/documento/:hash` em `frontend/src/routes.tsx` garantindo que ela não use o layout administrativo (Sidebar/Topbar) e não exija login.
  </action>
  <verify>
    <manual>Acessar /documento/{hash} em janela anônima e verificar a fidelidade do layout clínico sem elementos do dashboard administrativo.</manual>
  </verify>
  <acceptance_criteria>
    - Rota pública responde ao hash e carrega o documento com sucesso.
    - O botão de impressão físico no browser funciona de forma limpa.
  </acceptance_criteria>
  <done>Página pública standalone criada e rota configurada.</done>
</task>

<task type="auto">
  <name>Task 2: Modal de Seleção de Canais (ShareDocumentModal.tsx)</name>
  <read_first>frontend/src/pages/PetDetails.tsx</read_first>
  <files>
    frontend/src/components/ShareDocumentModal.tsx
  </files>
  <action>
    1. Criar o componente `ShareDocumentModal.tsx` em `frontend/src/components/`:
       - Carregar o pet, tutor e dados de contato (email e telefone).
       - Exibir o nome do tutor e checkboxes para:
         - Enviar por E-mail (habilitado se tutor tiver email cadastrado; se não, desabilitar com tooltip explicativo).
         - Enviar por WhatsApp (habilitado se tutor tiver telefone cadastrado; se não, desabilitar com tooltip).
       - Ao submeter, disparar requisição HTTP POST para o endpoint correspondente: `/prescriptions/:id/share` ou `/consent-terms/:id/share` enviando os canais selecionados.
       - Exibir feedback (toast ou mensagem interna) informando sucesso ou falha por canal utilizado.
  </action>
  <verify>
    <manual>Testar o modal com tutor contendo dados completos, e outro com dados ausentes, validando o comportamento dinâmico de habilitação das checkboxes e os tooltips de aviso.</manual>
  </verify>
  <acceptance_criteria>
    - As checkboxes são dinamicamente desabilitadas caso os dados de contato do tutor estejam em branco.
    - Sucesso e falha no disparo chamam feedback correspondente.
  </acceptance_criteria>
  <done>Modal de seleção de canais implementado.</done>
</task>

<task type="auto">
  <name>Task 3: Integração dos Botões de Compartilhamento na UI</name>
  <read_first>frontend/src/pages/PetDetails.tsx</read_first>
  <files>
    frontend/src/pages/PetDetails.tsx
    frontend/src/components/PrintPreviewModal.tsx
  </files>
  <action>
    1. No modal de preview de impressão (ex: `PrintPreviewModal.tsx` ou componente correspondente):
       - Adicionar o botão "Enviar ao Tutor" posicionado ao lado do botão "Imprimir".
       - Exibir o botão apenas quando o documento em preview tiver status `SIGNED` e for uma receita ou termo de consentimento.
       - Clicar no botão abre o modal `ShareDocumentModal`.
    2. Na timeline de prontuário em `PetDetails.tsx`:
       - Para os registros de receita e termo com status `SIGNED`, adicionar a opção "Enviar ao Tutor" no dropdown de ações do item ou como um ícone direto ao lado do botão de visualização de impressão.
       - Clicar na ação abre o modal `ShareDocumentModal`.
  </action>
  <verify>
    <manual>Acessar a timeline clínica do pet, verificar a presença e o correto funcionamento do botão de compartilhamento nos dois locais estabelecidos.</manual>
  </verify>
  <acceptance_criteria>
    - Botões integrados na timeline e no preview de impressão de documentos assinados.
    - O acionamento abre o modal de compartilhamento correto.
  </acceptance_criteria>
  <done>Botões de gatilho integrados na interface do usuário.</done>
</task>

</tasks>

<threat_model>
N/A
</threat_model>

<verification>
Verificação visual direta no frontend localmente e testes manuais integrados conforme descritos nas tarefas.
</success_criteria>
