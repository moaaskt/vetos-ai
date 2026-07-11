---
name: VetOS AI Design System
description: Calm, clean, and highly readable healthcare aesthetic for veterinary management.
colors:
  primary: "#148c8b"
  primary-foreground: "#f4faf9"
  neutral-bg: "#f4f6f9"
  neutral-fg: "#2a2d34"
  card: "#ffffff"
  border: "#dee1e6"
typography:
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "0.875rem"
    lineHeight: "1.25rem"
rounded:
  lg: "0.7rem"
  md: "calc(0.7rem - 2px)"
  sm: "calc(0.7rem - 4px)"
---

# Design System: VetOS AI

## 1. Overview

**Creative North Star: "The Clinical Sanctuary"**

O VetOS AI utiliza um sistema de design planejado para transmitir calma, precisão médica e absoluto controle operacional. A paleta é dominada por tons neutros frios e um verde-azulado clínico calmante (teal) como tom primário. O objetivo principal é reduzir a fadiga cognitiva de veterinários e assistentes sob estresse, oferecendo uma densidade de informação equilibrada e legibilidade impecável sob iluminação clínica direta.

**Key Characteristics:**
- Neutros sutilmente azulados que reduzem o cansaço visual.
- Alta legibilidade tipográfica com foco na hierarquia de dados clínicos.
- Formas suavemente arredondadas (0.7rem) que trazem uma sensação de cuidado e acessibilidade.

## 2. Colors

A paleta de cores foca em tons neutros muito claros para fundo e o verde-azulado de saúde (Teal) para foco e ações primárias.

### Primary
- **Clinical Teal** (oklch(0.55 0.11 180)): Usada para ações principais, destaques vitais e estados de foco ativos. Transmite profissionalismo e calma.

### Neutral
- **Sanctuary BG** (oklch(0.98 0.005 240)): Fundo principal sutilmente azulado, garantindo conforto e alto contraste com o texto.
- **Deep Slate Ink** (oklch(0.18 0.015 240)): Texto principal e elementos de alto contraste. Nunca usa preto puro para evitar rigidez.
- **Clean White** (oklch(1 0 0)): Fundo para cards e popovers, destacando-os suavemente do fundo da aplicação.
- **Soft Border** (oklch(0.90 0.01 240)): Linhas de divisão e bordas finas para separar informações sem criar ruído visual.

### Named Rules
**The Calm Balance Rule.** O tom Clinical Teal deve ser reservado para elementos de interação principal (botões de ação primária, abas ativas, links selecionados) e nunca ultrapassar 10% da superfície de qualquer tela.

## 3. Typography

**Display Font:** Inter, system-ui, sans-serif
**Body Font:** Inter, system-ui, sans-serif

### Hierarchy
- **Headline** (Medium/Bold, 1.5rem, 2rem): Títulos de seções principais do dashboard e prontuários.
- **Title** (Medium/SemiBold, 1.125rem, 1.75rem): Títulos de cards e grupos de informações.
- **Body** (Regular, 0.875rem, 1.25rem): Prontuários, dados clínicos e descrições. Comprimento máximo de linha ideal de 65-75ch.
- **Label** (Medium/SemiBold, 0.75rem, 1rem): Cabeçalhos de tabelas, status badges e metadados.

## 4. Elevation

O sistema prioriza superfícies planas por padrão, utilizando divisões finas e sutis diferenciações de cores neutras para delimitar áreas. Sombras são usadas de forma extremamente restrita para evitar poluição visual.

### Named Rules
**The Flat-By-Default Rule.** Elementos de tela (cards, tabelas, blocos) são completamente planos e assentados na tela. Sombras leves aparecem unicamente em estados flutuantes (como modais) ou na resposta direta a interações (hover).

## 5. Components

### Buttons
- **Shape:** Cantos suavizados (0.7rem / 11.2px)
- **Primary:** Fundo Clinical Teal com texto Sanctuary BG. Espaçamento confortável para toque.
- **Hover:** Transições suaves de opacidade ou escurecimento leve do tom primário.

### Cards / Containers
- **Corner Style:** Cantos arredondados (0.7rem / 11.2px)
- **Background:** Clean White (`#ffffff`)
- **Border:** Soft Border (`1px solid`) para delimitação clara sem peso visual.

### Inputs / Fields
- **Style:** Fundo transparente ou Clean White com bordas Soft Border.
- **Focus:** Destaque através de borda ou anel Clinical Teal.

## 6. Do's and Don'ts

### Do:
- **Do** usar o tom Clinical Teal de forma extremamente cirúrgica apenas para ações que exijam a atenção direta do usuário.
- **Do** garantir que qualquer informação crítica sobre saúde animal (como alergia) tenha redundância visual de cor + ícone/texto em negrito.
- **Do** manter o limite de comprimento de linha no texto do prontuário para leitura confortável.

### Don't:
- **Don't** usar degradês de texto ou fundos vibrantes/neon no painel operacional.
- **Don't** aninhar cards dentro de outros cards; use divisores sutis ou espaçamento em vez disso.
- **Don't** usar texto cinza claro sobre fundos claros; mantenha o Deep Slate Ink para alta legibilidade.
