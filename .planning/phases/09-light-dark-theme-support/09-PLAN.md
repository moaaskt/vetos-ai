---
status: completed
must_haves:
  truths:
    - Nenhuma rota, chave de API ou lógica de negócios é alterada.
    - O tema padrão inicial para novos usuários da clínica é o modo claro (light mode).
    - O tema escolhido persiste no localStorage na chave vetos_theme.
  artifacts:
    - index.css estruturado com variáveis para :root (claro) e .dark (escuro).
    - ThemeContext.tsx provendo o estado e persistência do tema.
    - Botão de alternância (theme toggle) na barra superior (Layout.tsx).
  key_links:
    - "09-CONTEXT.md": "Decisões de arquitetura de tema"
    - "09-UI-SPEC.md": "Contrato de design visual e tokens"
---

# Phase 9 Plan: Suporte a Temas Claro / Escuro (Light/Dark Theme)

## Task 1: Reestruturação dos Tokens no CSS (`index.css`)
- **files:**
  - `frontend/src/index.css`
- **action:**
  - Mover as cores escuras atuais para o seletor `.dark`.
  - Definir em `:root` a paleta clara premium (fundo suave quente, cartões brancos, bordas sutis em ardósia, destaques em verde/teal calmo).
  - Preservar o mapeamento `@theme inline` para compatibilidade com os utilitários Tailwind.
- **verify:**
  - Garantir que as variáveis `--background`, `--foreground`, `--card`, `--border` etc. existam em ambos os modos.
- **done:**
  - [x] Concluído. Fundo e superfícies reestruturados.

## Task 2: Criação do Contexto de Tema (`ThemeContext.tsx`) e Integração (`App.tsx`)
- **files:**
  - `frontend/src/context/ThemeContext.tsx`
  - `frontend/src/App.tsx`
- **action:**
  - Em `ThemeContext.tsx`: Implementar `ThemeProvider` provendo `theme` (`light` | `dark`) e `toggleTheme()`.
  - Ler e salvar no `localStorage` sob a chave `vetos_theme`. Default inicial: `light`.
  - Sincronizar dinamicamente a classe `dark` no elemento `document.documentElement` (`<html>`).
  - Em `App.tsx`: Envolver a árvore de componentes com o `<ThemeProvider>`.
- **done:**
  - [x] Concluído. Provedor de tema em funcionamento.

## Task 3: Inclusão do Botão de Alternância de Tema na Barra Superior (`Layout.tsx`)
- **files:**
  - `frontend/src/components/Layout.tsx`
- **action:**
  - Adicionar o botão de alternância de tema no cabeçalho (topbar), ao lado dos indicadores de clínica e suporte.
  - Usar os ícones `Sun` e `Moon` da biblioteca `lucide-react`.
  - Ao clicar, acionar `toggleTheme()` com transição suave e tooltip clara em PT-BR ("Alternar para modo escuro" / "Alternar para modo claro").
- **done:**
  - [x] Concluído. Botão com feedback instantâneo inserido no topo.

## Task 4: Verificação de Build e Qualidade
- **files:**
  - N/A
- **action:**
  - Executar verificação de AST no diretório `frontend`.
- **verify:**
  - Compilação `tsc -b` executada sem erros.
- **done:**
  - [x] Concluído com sucesso.
