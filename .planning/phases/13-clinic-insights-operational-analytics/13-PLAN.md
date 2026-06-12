# Phase 13: Clinic Insights & Operational Analytics - Plan (Wave 13A)

Este plano descreve a implementação do módulo de Analytics e a tela de relatórios operacionais utilizando dados existentes, mantendo isolamento de inquilino (multitenancy) no backend e uma interface responsiva premium com suporte a temas no frontend.

## 1. Escopo e Objetivos
- Criar o primeiro dashboard analítico pragmático sem alteração no esquema do banco de dados.
- Implementar o backend de relatórios sob o endpoint `GET /analytics/overview` escopado por `clinicId`.
- Implementar a página de Analytics com cards premium, layout moderno e responsivo, compatível com temas claro e escuro.

## 2. Tarefas de Implementação

### Backend
- **[x] Módulo e Serviço de Analytics:** Criar `analytics.service.ts` contendo as agregações do Prisma:
  - `appointmentsToday`, `appointmentsThisWeek`, `appointmentsByStatus` (agrupados).
  - `totalClients`, `totalPets`.
  - `upcomingVaccinesNext7Days` (baseado em `nextDoseDate` de `VaccineRecord`).
  - `inactiveClients90Days` (clientes sem agendamento nos últimos 90 dias).
  - `notificationsLast7Days` (total, falhas e agrupado por canal `EMAIL`/`WHATSAPP`).
- **[x] Controlador de Analytics:** Criar `analytics.controller.ts` expondo `GET /analytics/overview` com `JwtAuthGuard` e `@CurrentUser()`.
- **[x] Registro do Módulo:** Registrar o `AnalyticsModule` no `app.module.ts`.

### Frontend
- **[x] Tipagem de API:** Adicionar `AnalyticsOverview` em `frontend/src/lib/api.ts`.
- **[x] Componente de Página:** Criar `frontend/src/pages/Analytics.tsx` com layout premium (cards estilizados, barras de progresso CSS nativo para status de consultas e canais de notificação).
- **[x] Rotas:** Registrar `/analytics` em `frontend/src/App.tsx`.
- **[x] Layout e Sidebar:** Adicionar "Relatórios" à barra lateral em `frontend/src/components/Layout.tsx` e mapear o breadcrumb correspondente.

## 3. Plano de Verificação

### Testes de Compilação
- Compilar o backend (`npm run build` na pasta `backend`) para certificar integridade estática.
- Compilar o frontend (`npm run build` na pasta `frontend`) para certificar integridade estática.

### Teste Manual de Fluxo
- Fazer login como gestor da clínica.
- Navegar para `/analytics` usando a barra lateral.
- Validar se os cards premium carregam corretamente.
- Validar se a alternância de temas claro/escuro se aplica adequadamente aos cards.
