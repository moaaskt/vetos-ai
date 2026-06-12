# Fase 11: Prontuário Veterinário e Histórico Clínico - Contrato de Design de UI

**Data de Criação:** 2026-05-19
**Status:** Aprovado para Implementação (Approved)

Este documento define os padrões visuais, interações e especificações de design system para a interface de prontuário médico veterinário (Pet Profile / Clinical Record), garantindo consistência com a identidade visual premium e os modos Light/Dark implementados no VetOS AI.

---

## 1. Paleta de Cores & Tokens de Design (OKLCH System)

Os componentes clínicos devem usar os tokens de cores do design system existentes na base de código para manter a coerência temática:

### Tons Clínicos Especializados

| Uso Semântico | Modo Light (Tokens CSS) | Modo Dark (Tokens CSS) | Significado Visual |
| :--- | :--- | :--- | :--- |
| **Linha do Tempo / Vacinas** | `oklch(0.627 0.265 303.9)` (Purple-600) | `oklch(0.707 0.215 303.9)` (Purple-400) | Saúde, prevenção, imunização |
| **Alergia Leve** | `oklch(0.795 0.184 81.1)` (Amber-500) | `oklch(0.852 0.155 81.1)` (Amber-400) | Atenção leve / moderada |
| **Alergia Severa** | `oklch(0.627 0.265 303.9)` (Red-600) | `oklch(0.697 0.225 303.9)` (Red-400) | Risco crítico de alergia |
| **Notas Clínicas** | `oklch(0.609 0.126 221.7)` (Slate-600) | `oklch(0.789 0.086 221.7)` (Slate-400) | Observações e anotações gerais |
| **Procedimentos** | `oklch(0.551 0.201 262.9)` (Indigo-600) | `oklch(0.681 0.161 262.9)` (Indigo-400) | Procedimentos cirúrgicos ou ambulatoriais |

---

## 2. Layout da Interface Premium (Bento Grid Dashboard)

O perfil do paciente será estruturado como uma central clínica dinâmica (Bento Grid) composta por três áreas funcionais:

```
+---------------------------------------------------------------------------------+
|                       CABECALHO DO PACIENTE (PET DETAILS)                       |
|  [PawPrint] Thor (Canino, Golden Retriever, 4 anos) | Tutor: João da Silva      |
+---------------------------------------------------+-----------------------------+
|                                                   |                             |
|  PAINEL ESQUERDO: TIMELINE CLÍNICA (Abas)         |  PAINEL DIREITO (Lateral):  |
|  [ Timeline | Vacinas | Peso & Alergias ]         |  INFORMAÇÕES DE SAÚDE       |
|                                                   |                             |
|  +---------------------------------------------+  |  +-----------------------+  |
|  | (Aba Timeline Ativa)                        |  |  | Cartão de Alergias    |  |
|  | - Consulta Geral (19/05/2026)                |  |  | [Tag: Dipirona (HIGH)]|  |
|  | - Vacina Antirrábica (10/05/2026)           |  |  +-----------------------+  |
|  | - Limpeza de Tártaro (05/05/2026)           |  |                             |
|  +---------------------------------------------+  |  +-----------------------+  |
|                                                   |  |  | Gráfico de Peso       |  |
|                                                   |  |  | [Curva de Peso/Meses] |  |
|                                                   |  |  +-----------------------+  |
|                                                   |                             |
+---------------------------------------------------+-----------------------------+
```

### Detalhes das Seções:

1. **Cabeçalho Principal do Pet:**
   - Card premium no topo com a foto genérica do animal (usando a inicial do nome ou um ícone estilizado de pata `PawPrint`), nome grande, raça, idade e um link direto para a ficha do Tutor (`User`).
   - Botão para retornar à listagem geral de pacientes e botões de ação rápidos (Registrar Peso, Adicionar Alergia, Nova Nota/Procedimento).

2. **Timeline Clínica Central (Painel Esquerdo):**
   - Apresenta um tracejado vertical que conecta todos os eventos clínicos do animal de forma fluida.
   - Cada nó da timeline possui um ícone correspondente ao tipo de evento (ex: `Heart` para consultas, `ShieldCheck` ou `Injection` para vacinas, `FileText` para notas, `Wrench` ou `Activity` para procedimentos).
   - Efeito visual de hover nos cartões de evento da timeline (leve escala e borda colorida correspondente).

3. **Curva de Peso & Alergias (Painel Direito):**
   - **Gráfico de Peso:** Gráfico de linha interativo minimalista, mostrando a variação de peso ao longo do tempo. Eixos limpos, pontos interativos com tooltip exibindo a data e o peso em kg.
   - **Controle de Alergias:** Caixa de alerta premium com tags coloridas. Um botão de "+" para adicionar de forma rápida novas alergias usando um dropdown modal.

---

## 3. Micro-animações e Transições

- **Entrada da Página:** Transição de desvanecimento suave (`animate-in fade-in-0 duration-500 slide-in-from-bottom-3`) ao abrir a ficha do pet.
- **Transição de Abas:** Troca de abas com efeito suave de opacidade e deslocamento horizontal.
- **Efeitos de Hover:**
  - Cards de vacinas e notas clínicas devem ter efeito de sombra sutil (`shadow-md`) e uma sutil mudança na borda ao passar o mouse.
  - O gráfico de peso deve possuir animações nativas na plotagem de pontos para suavizar o carregamento.

---

## 4. Acessibilidade (a11y) & Usabilidade

- **Contraste de Cores:** As tags de gravidade de alergias e status clínicos devem respeitar os limites de contraste da WCAG AA no modo Light e Dark.
- **Navegação via Teclado:** Elementos interativos (abas, botões de exclusão, botões de ação rápida e inputs de modal) devem possuir anéis de foco bem definidos (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`).
- **Estados de Carregamento:** Exibir `Skeleton` personalizados que correspondem à Bento Grid do prontuário durante a busca de dados no backend, eliminando mudanças abruptas de layout (CLS - Cumulative Layout Shift).
