# Frontend Architecture & Design System

O frontend do VetOS AI é desenvolvido em **React** (utilizando Vite como bundler) e utiliza **TailwindCSS v4** para estilização utilitária e tokens semânticos.

## 1. Organização do Código

Localizado em `/frontend/src/`, o projeto adota a seguinte estrutura:

* `/components`: Componentes reutilizáveis de interface (Shadcn-like, botões, modais).
* `/context`: Provedores de estado global (`AuthContext` para sessões/JWT e `ThemeContext` para modo claro/escuro).
* `/lib`: Integração com serviços externos, incluindo cliente de requisições `api` baseado no Axios.
* `/pages`: Telas completas da aplicação (Dashboard, Agenda, Prontuários, Analytics, Configuração de Mensageria).

## 2. Design System: "The Clinical Sanctuary"

O design system do VetOS AI visa transmitir calma, precisão médica e absoluto controle operacional através de:
- **Cores Semânticas**: Paleta com tons frios e verde-azulado clínico (Teal) como cor de foco principal.
- **Tipografia Inter**: Alta legibilidade com escalas claras para cabeçalhos e prontuários médicos.
- **Regra Flat-by-Default**: Superfícies planas com bordas sutis (`border-border`), reservando sombras apenas para elementos flutuantes (como modais).

### Paleta de Cores
* **Primary (Teal)**: `#148c8b` (oklch(0.55 0.11 180)) - Focos e ações primárias.
* **Neutral Background**: `#f4f6f9` (oklch(0.98 0.005 240)) - Fundo sutilmente azulado.
* **Neutral Foreground**: `#2a2d34` (oklch(0.18 0.015 240)) - Texto e tinta principal.
* **Card BG**: `#ffffff` (oklch(1 0 0)) - Fundo de cartões e popovers.
* **Border**: `#dee1e6` (oklch(0.90 0.01 240)) - Divisores suaves.
