---
phase: 16B-prontu-rio-avan-ado-layout-de-impress-o-e-assinatura-digital
plan: "04"
type: execute
wave: 4
depends_on: ["03-PLAN.md"]
files_modified:
  - frontend/src/components/PrintPreviewModal.tsx
  - frontend/src/components/print/PrintProntuario.tsx
  - frontend/src/components/print/PrintReceita.tsx
  - frontend/src/components/print/PrintTermo.tsx
  - frontend/src/index.css
  - frontend/src/pages/PetDetails.tsx
autonomous: true
requirements: ["REQ-01", "REQ-02", "REQ-03", "REQ-04"]

must_haves:
  truths:
    - "O modal de visualização de impressão exibe o layout com cabeçalho, corpo e rodapé."
    - "Documentos com status DRAFT exibem o botão 'Assinar Documento' no preview."
    - "Ao clicar em 'Assinar Documento', o rascunho é assinado no servidor e retorna com QR Code e hash SHA-256."
    - "Chamar o diálogo window.print() imprime apenas a folha de documento limpa, escondendo barras de navegação e botões da SPA."
  artifacts:
    - path: "frontend/src/components/PrintPreviewModal.tsx"
      provides: "Visualizador fullscreen de impressão e painel de controle de assinatura"
    - path: "frontend/src/components/print/PrintProntuario.tsx"
      provides: "Layout de impressão A4 do Prontuário Clínico completo"
    - path: "frontend/src/components/print/PrintReceita.tsx"
      provides: "Layout de impressão A4 de Receitas Médicas"
    - path: "frontend/src/components/print/PrintTermo.tsx"
      provides: "Layout de impressão A4 de Termos de Consentimento"
  key_links:
    - from: "frontend/src/components/PrintPreviewModal.tsx"
      to: "frontend/src/components/print/PrintReceita.tsx"
      via: "Renderização do layout específico de receita"
    - from: "frontend/src/components/PrintPreviewModal.tsx"
      to: "frontend/src/components/print/PrintTermo.tsx"
      via: "Renderização do layout específico de termo"
---

<objective>
Implementar a interface de visualização pré-impressão em modal fullscreen, os layouts de página A4 específicos de cada documento e configurar as diretivas CSS de impressão nativa.

Purpose: Habilitar o veterinário a revisar documentos, assinar digitalmente para chancelar a integridade jurídica e imprimir o PDF oficial limpo usando o diálogo nativo do navegador.
Output: PrintPreviewModal.tsx, layouts de impressão criados e integrados, e css de impressão em index.css adicionado.
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
@frontend/src/pages/PetDetails.tsx
@frontend/src/index.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Criação dos Layouts de Impressão e Modal de Visualização (PrintPreviewModal)</name>
  <read_first>
    frontend/src/pages/PetDetails.tsx
    frontend/src/components/Modal.tsx
  </read_first>
  <files>
    frontend/src/components/PrintPreviewModal.tsx
    frontend/src/components/print/PrintProntuario.tsx
    frontend/src/components/print/PrintReceita.tsx
    frontend/src/components/print/PrintTermo.tsx
    frontend/src/pages/PetDetails.tsx
  </files>
  <action>
    1. Criar a pasta 'frontend/src/components/print/' e os componentes de layout A4:
       - 'PrintProntuario.tsx': Compila cabeçalho da clínica, dados básicos do pet/tutor, timeline de consultas, notas, procedimentos, exames e vacinas.
       - 'PrintReceita.tsx': Exibe os campos estruturados de medicamentos em tabela organizada e a caixa de observações adicionais.
        - 'PrintTermo.tsx': Renderiza o texto final do termo de consentimento.
        - Todos os três devem conter um cabeçalho oficial (logo/nome/endereço da clínica) e rodapé estruturado (data, campo para assinatura manual do veterinário, o link legível da URL de verificação 'verificationUrl' e o QR Code de verificação online renderizado a partir de 'verificationQrCode' quando assinado) (D-03).
     2. Criar o componente modal 'frontend/src/components/PrintPreviewModal.tsx' fullscreen:
       - Recebe o documento ('prescription', 'consentTerm' ou o próprio 'pet' para o prontuário completo) e o tipo.
       - Renderiza no corpo o layout correspondente ('PrintProntuario', 'PrintReceita' ou 'PrintTermo') envolvido por uma div com a classe CSS 'printable-container'.
       - Exibe uma barra de ferramentas superior fixa na tela contendo:
          - Botão "Fechar" (ícone X).
          - Botão "Assinar Documento" (destacado e visível apenas se o status for DRAFT). Ao clicar, chama a rota de assinatura no backend ('POST /prescriptions/:id/sign' ou '/consent-terms/:id/sign'), atualiza os dados locais do documento com o hash, a URL textual e o QR code base64 ('verificationQrCode') gerados e altera o status para SIGNED.
          - Botão "Imprimir" (só habilitado se o status for SIGNED ou se for o prontuário que não exige assinatura digital). Ao clicar, invoca 'window.print()' nativo (D-01).
    3. Integrar o 'PrintPreviewModal' no 'frontend/src/pages/PetDetails.tsx' acionando-o pelo menu dropdown de ações centralizado ou pelo botão de visualização em cada card da timeline.
  </action>
  <verify>
    <automated>npm run build --prefix frontend</automated>
  </verify>
  <acceptance_criteria>
    - Todos os layouts compilam sem erros TypeScript.
     - O modal de preview exibe o botão "Assinar Documento" para rascunhos.
     - Ao assinar, os dados retornam com hash SHA-256, a URL pública de verificação e a imagem base64 do QR code no campo 'verificationQrCode', habilitando o botão "Imprimir".
     - O arquivo 'PetDetails.tsx' compila com sucesso.
  </acceptance_criteria>
  <done>Componentes de layouts de impressão A4 e visualizador de impressão fullscreen criados e integrados ao prontuário.</done>
</task>

<task type="auto">
  <name>Task 2: Configuração das Diretivas de Impressão CSS (@media print)</name>
  <read_first>
    frontend/src/index.css
  </read_first>
  <files>
    frontend/src/index.css
  </files>
  <action>
    Editar o arquivo 'frontend/src/index.css' para adicionar as diretivas de impressão adequadas:
    1. Usar a regra '@media print' para garantir que, ao abrir a tela de impressão do navegador:
       - Ocultar toda a estrutura do aplicativo SPA e elementos da tela principal (como sidebar, botões, cabeçalhos do site, barra de ferramentas superior do modal) adicionando classes como 'print:hidden' ou aplicando 'visibility: hidden' a todo o body com exceção de '.printable-container' (que recebe 'visibility: visible').
       - Posicionar o contêiner '.printable-container' no topo e esquerda absoluta da folha física.
       - Definir as margens de impressão adequadas: '@page { size: A4; margin: 15mm; }'.
       - Forçar escala de cinza e alto contraste de texto (fundo branco, texto preto puro).
       - Aplicar a propriedade 'break-inside-avoid' em blocos lógicos como tabelas, caixas de medicamento e campos de assinatura no rodapé para que não sejam quebrados no meio ao mudar de folha física.
  </action>
  <verify>
    <automated>npm run build --prefix frontend</automated>
  </verify>
  <acceptance_criteria>
    - O arquivo 'frontend/src/index.css' contém a seção '@media print' estruturada com suporte a A4, margem de 15mm e ocultação de elementos desnecessários.
    - A propriedade 'break-inside-avoid' está mapeada para contêineres de assinatura e tabelas de medicamentos.
  </acceptance_criteria>
  <done>Estilos CSS de impressão nativa configurados e otimizados para economia de tinta e formatação jurídica.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries
- Client (Frontend SPA) → Printer (Local OS Print Spooler): Saída de dados gerada pelo browser para a fila de impressão.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16B-08  | Information Disclosure | Print Spooler | accept | Confiar nas políticas de segurança do sistema operacional local do usuário que gerencia a fila de impressão. |
| T-16B-09  | Tampering | Print dialog bypass | mitigate | Impedir a exibição do botão "Imprimir" e desencorajar a impressão física de receitas/termos que ainda estejam em status DRAFT (sem hash e sem QR code). |
</threat_model>

<verification>
Após a implementação de todo o fluxo, a verificação completa da fase compreende:
1. Rodar os testes do backend para garantir que as APIs estão corretas.
2. Iniciar a aplicação localmente, abrir o prontuário de um pet de teste.
3. Criar uma receita com medicamentos e um termo de consentimento a partir de um template.
4. Clicar em "Visualizar Impressão" em cada documento na timeline para inspecionar o layout A4.
5. Clicar em "Assinar Documento" no modal de preview, verificar a geração do QR Code e do hash SHA-256 no rodapé do documento.
6. Clicar em "Imprimir" e verificar na pré-visualização do navegador que o documento A4 está limpo e formatado corretamente.
</verification>

<success_criteria>
- A visualização de impressão e a geração do PDF nativo funcionam sem distorções ou quebras de página impróprias.
- Os documentos emitidos são devidamente assinados criptograficamente na base de dados (status SIGNED, hash e QR Code persistidos).
- O CSS de impressão oculta toda a UI do sistema e exibe apenas o documento A4.
</success_criteria>

## Artifacts this phase produces
- `frontend/src/components/PrintPreviewModal.tsx` (modal de controle e preview de impressão).
- `frontend/src/components/print/PrintProntuario.tsx` (layout do prontuário).
- `frontend/src/components/print/PrintReceita.tsx` (layout de receitas).
- `frontend/src/components/print/PrintTermo.tsx` (layout de termos).
- Diretivas CSS `@media print` e de quebra de página adicionadas ao `frontend/src/index.css`.
