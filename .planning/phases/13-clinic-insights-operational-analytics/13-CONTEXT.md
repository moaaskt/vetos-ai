# Fase 13: Análises Clínicas e Métricas Operacionais - Contexto

**Data de Criação:** 2026-06-04
**Status:** Pronto para Planejamento (Ready for Planning)

<domain>
## Limites da Fase

O escopo desta fase é focado na entrega de um dashboard analítico pragmático voltado para administradores da clínica, consolidando dados reais do VetOS AI para melhoria do entendimento operacional da clínica, retenção de pacientes e performance do canal de mensagens.

- **Dashboard de Analytics:** Uma nova página no painel de administração da clínica sob a rota `/analytics` ou `/reports` que apresenta métricas operacionais consolidadas.
- **Métricas Operacionais Reais:**
  - Agendamentos consolidados por status (e.g. Confirmado, Cancelado, Pendente).
  - Agendamentos distribuídos por período de tempo (mensal/semanal).
  - Vacinas a vencer e próximas aplicações mapeadas para os pacientes.
  - Clientes inativos (para acompanhamento e ações de retenção).
  - Total geral de pacientes e clientes ativos por clínica.
  - Desempenho e taxa de sucesso/falha do envio de notificações por canal (E-mail e WhatsApp).
  - Tendências recentes de novos cadastros e atendimentos.
- **Uso Estrito de Dados Existentes:** A consolidação de métricas será feita via agregação de tabelas já existentes no Prisma (Prisma Client).
- **Sem IA (No AI):** Não serão implementadas predições de IA ou otimizações automáticas de agendamento nesta fase.
- **Sem Faturamento (No Billing):** Sem integrações financeiras ou métricas monetárias corporativas.
- **Sem Novos Provedores:** Sem adição de provedores de mensageria adicionais (mantendo SMTP e Evolution API).
- **Sem Alterações nas Telas Atuais:** Nenhum redesign das páginas existentes do dashboard ou tabelas será efetuado.
</domain>

<decisions>
## Decisões de Implementação Propostas

### API e Lógica de Negócios (Backend)
- **D-01:** Adicionar um módulo/controlador dedicado `AnalyticsController` sob a rota `/analytics` (ou integrá-lo no `DashboardController` se adequado).
- **D-02:** Scoping estrito por `clinicId` (Tenant Isolation) em todas as queries e agregações do Prisma.
- **D-03:** Rotas de API que retornam dados estruturados para gráficos (ex: séries temporais para consultas, dados agrupados para pizza/barras de status).

### Experiência do Usuário (Frontend)
- **D-04:** Nova tela `/settings/reports` ou `/analytics` integrada à barra lateral/menu do administrador da clínica.
- **D-05:** Visualizações gráficas modernas e acessíveis (usando bibliotecas de gráficos leves como Chart.js, Recharts ou componentes SVG puros integrados com Tailwind).
- **D-06:** Layout responsivo, com estados de carregamento (Skeleton loading) e tratamentos adequados para ausência de dados (Empty States).

### Banco de Dados
- **D-07:** Nenhuma alteração de modelo no Prisma Schema. A análise consumirá as tabelas existentes de `Appointment`, `Vaccine`, `Client`, `Pet`, `NotificationLog` e `NotificationConfig`.
</decisions>

<canonical_refs>
## Referências Canônicas

- `.planning/ROADMAP.md` - Definição da Fase 13.
- `.planning/STATE.md` - Estado do projeto e linha do tempo.
- `backend/src/` - Onde os novos endpoints do backend residirão.
- `frontend/src/pages/` - Localização da nova página `/analytics` ou `/reports`.
</canonical_refs>

<deferred>
## Ideias Postergadas (Fora de Escopo)
- Algoritmos preditivos de IA para otimização de horário de consultas.
- Exportação de relatórios em arquivos PDF ou planilhas Excel (XLSX).
- Métricas financeiras e fluxo de faturamento.
- Relatórios avançados com filtros multidimensionais dinâmicos e exportações agendadas.
</deferred>
