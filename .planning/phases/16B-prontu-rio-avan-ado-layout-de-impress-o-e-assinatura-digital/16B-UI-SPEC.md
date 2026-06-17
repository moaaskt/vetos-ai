---
phase: 16B
slug: prontuario-avancado-impressao-assinatura
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-17
---

# Fase 16B — Contrato de Design de UI (UI-SPEC)

> Contrato visual e de interação para a Fase 16B (Prontuário Avançado, Layout de Impressão e Assinatura Digital). Gerado pelo GSD UI Researcher para consumo pelo planejador e executor.

---

## Design System

| Propriedade | Valor |
|-------------|-------|
| Ferramenta | none (Instalação manual no projeto) |
| Preset | not applicable |
| Biblioteca de componentes | custom / radix (baseado nos componentes já existentes na pasta `components/ui/`) |
| Biblioteca de ícones | lucide-react |
| Fonte | font-sans (Inter/Geist com suporte a recursos de renderização e ligaduras aplicados no `index.css`) |

---

## Escala de Espaçamento

Os valores de espaçamento declarados abaixo baseiam-se em uma escala de 8 pontos (múltiplos de 4):

| Token | Valor | Uso Recomendado |
|-------|-------|-----------------|
| xs | 4px | Espaçamento entre ícone e texto (gaps), padding inline de badges |
| sm | 8px | Espaçamento interno de campos de formulário, margem entre tags de alergias |
| md | 16px | Padding interno de cards na timeline unificada, grid gap padrão |
| lg | 24px | Padding interno de modais principais, espaçamento entre blocos do perfil do paciente |
| xl | 32px | Separação entre seções verticais principais na página de detalhes |
| 2xl | 48px | Espaçamento entre cabeçalhos de página e a linha do tempo principal |
| 3xl | 64px | Margens extremas de páginas inteiras ou espaçamento inferior de visualização mobile |

**Exceções:**
1. **Margem de Impressão Física:** Definida explicitamente via CSS de impressão: `@page { margin: 15mm; }` para garantir alinhamento perfeito do cabeçalho e rodapé no papel A4.
2. **Alvos de Toque (Touch Targets):** Tamanho mínimo de interatividade móvel e cliques fixado em 44px de altura/largura para botões de ação e itens de menu dropdown no celular.

---

## Tipografia

| Papel (Role) | Tamanho (Size) | Peso (Weight) | Altura da Linha (Line Height) |
|--------------|----------------|---------------|-------------------------------|
| Body | 14px | regular (400) / medium (500) | 1.5 (Melhor legibilidade clínica) |
| Label | 12px | bold (700) | 1.25 |
| Heading | 20px | bold (700) | 1.2 |
| Display | 28px | extrabold (800) | 1.2 |

*Nota:* Documentos e comprovantes físicos no layout de impressão utilizam fonte de tamanho reduzido (10px a 11px com peso regular) para informações densas de rodapé como hashes SHA-256 e termos legais de responsabilidade.

---

## Cores

A paleta de cores segue as definições do arquivo `frontend/src/index.css` utilizando variáveis baseadas no espaço de cores OKLCH (com variações automáticas de Light/Dark Mode):

| Papel (Role) | Valor (Variável CSS) | Uso Recomendado |
|--------------|----------------------|-----------------|
| Dominante (60%) | `oklch(0.98 0.005 240)` (Light)<br/>`oklch(0.18 0.012 235)` (Dark) | Fundo da aplicação e grandes áreas de tela |
| Secundário (30%) | `oklch(1 0 0)` (Light)<br/>`oklch(0.22 0.012 230)` (Dark) | Cards, modais de formulário, barra lateral e cabeçalhos de ficha |
| Sotaque/Accent (10%) | `oklch(0.55 0.11 180)` (Light)<br/>`oklch(0.62 0.07 183)` (Dark) | Botões primários de ação ("Salvar", "Visualizar"), badges ativos, links de navegação |
| Destrutivo | `oklch(0.60 0.16 25)` (Light)<br/>`oklch(0.64 0.14 25)` (Dark) | Botão de exclusão de rascunhos, indicativos visuais de alergias críticas |

**Accent reservado exclusivamente para:**
- Botões primários de fluxo ("Visualizar Impressão", "Assinar Documento", "Gerar Receita", "Gerar Termo").
- Links de navegação ativos no topo da página.
- Bordas de seleção de foco em campos de formulário estruturado.

**Regras Específicas de Cor para Impressão Física (`@media print`):**
Para fins de economia de tinta e contraste legível em papel, o CSS de impressão deve sobrescrever a paleta digital:
- Fundo do documento: Branco puro (`#ffffff`).
- Texto em geral: Cinza escuro ou Preto puro (`#0f172a` ou `#000000`).
- Bordas e divisores: Cinza claro (`#e2e8f0`).
- Elementos com cores de sotaque digital (como Teal do `--primary`) devem ser convertidos em escala de cinza de alto contraste.

---

## Contrato de Redação (Copywriting Contract)

| Elemento | Cópia (Copy) |
|----------|--------------|
| CTA Primário: Visualizar Preview | **Visualizar Impressão** |
| CTA Primário: Assinar Documento | **Assinar Documento** |
| CTA Primário: Gravar Rascunho | **Salvar Rascunho** |
| CTA Secundário: Cancelar Ação | **Cancelar** |
| Título de Estado Vazio (Receita) | **Nenhuma receita médica emitida** |
| Corpo de Estado Vazio (Receita) | **Este paciente não possui receitas registradas no prontuário. Clique no menu de ações para gerar uma nova receita.** |
| Título de Estado Vazio (Termo) | **Nenhum termo de consentimento assinado** |
| Corpo de Estado Vazio (Termo) | **Nenhum termo de consentimento foi assinado para este pet. Clique no menu de ações para preencher um termo a partir dos modelos.** |
| Mensagem de Erro na Assinatura | **Falha ao assinar o documento. Por favor, verifique a conexão com o servidor e tente novamente.** |
| Mensagem de Erro de Integridade | **Documento inválido ou modificado. A verificação do hash SHA-256 falhou. Por favor, recarregue e valide as informações originais.** |
| Confirmação de Ação Destrutiva | **Excluir Rascunho**: Tem certeza de que deseja remover permanentemente este rascunho de documento? Esta operação não pode ser revertida e o rascunho será perdido. |

*Nota:* Documentos assinados (`SIGNED`) são legalmente e tecnicamente imutáveis. O botão "Excluir" ou "Editar" deve ser totalmente ocultado da interface e da timeline para estes itens, exibindo apenas o botão "Visualizar/Imprimir".

---

## Segurança dos Componentes (Registry Safety)

| Registro | Blocos Utilizados | Status do Gate de Segurança |
|----------|-------------------|-----------------------------|
| shadcn oficial | button, card, dialog, input, skeleton | não requerido (uso interno livre) |
| third-party | none | not applicable |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Aprovação:** pending
