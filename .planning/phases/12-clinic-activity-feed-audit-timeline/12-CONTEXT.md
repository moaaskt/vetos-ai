# Fase 12: Feed de Atividades da Clínica - Contexto

**Data de Criação:** 2026-05-26
**Status:** Pronto para Planejamento (Ready for Planning)

<domain>
## Limites da Fase

O escopo desta fase é prático e intencionalmente mantido pequeno. O objetivo é substituir a lista estática do dashboard por um feed de atividades recentes real para fazer o dashboard "ganhar vida", sem a complexidade de um sistema de auditoria corporativo.

- **Feed Global de Atividades:** Um componente na página inicial do dashboard da clínica exibindo atividades recentes de forma cronológica, com paginação simples e labels em PT-BR. Mostrar estado vazio (empty state) se não houver atividade.
- **Leitura em tempo real (Read-only):** O feed é composto por registros já existentes no banco de dados. Nenhum rastreamento de criação/edição em massa será adicionado neste momento.
- **Entidades Rastreáveis (Read-only):**
  - Agendamentos (Appointments)
  - Clientes (Clients)
  - Pets (Pacientes)
  - Prontuários Clínicos (Clinical Records)
  - Alergias (Allergies)
  - Vacinas (Vaccines)
  - Registros de Peso (Weight Records)
- **Não implementar:** Auditoria corporativa completa, interceptadores complexos ou rastreamento de mudanças profundas.
</domain>

<decisions>
## Decisões de Implementação Propostas

### API e Lógica de Negócios (Backend)
- **D-01:** Adicionar um endpoint `GET /dashboard/activity` (provavelmente no módulo `DashboardModule`).
- **D-02:** A lógica para montar o feed deve buscar as entidades suportadas com `createdAt` ou `updatedAt` recente do banco de dados usando Prisma, respeitando sempre o escopo do tenant (`clinicId`).
- **D-03:** Formatar a saída como uma lista de objetos polimórfica unificada, onde cada item tem uma data e um tipo (ex: `type: 'APPOINTMENT'`, `message: 'Nova consulta agendada'`).

### Experiência do Usuário (Frontend)
- **D-04:** Atualizar o Dashboard para consumir a nova rota `/dashboard/activity`.
- **D-05:** Construir uma lista de feed visualmente agradável, usando labels descritivas em português do Brasil (PT-BR).
- **D-06:** Apresentar um layout de "Empty State" atraente caso nenhuma atividade tenha ocorrido na clínica.

### Arquitetura de Banco de Dados
- **D-07:** Nenhuma alteração no Prisma Schema será feita para auditoria. A funcionalidade será construída agregando dados de `createdAt`/`updatedAt` das tabelas já existentes.
</decisions>

<canonical_refs>
## Referências Canônicas

- `.planning/ROADMAP.md` - Definição da Fase 12.
- `.planning/STATE.md` - Progresso do projeto e contexto acumulado.
- `backend/src/dashboard/` - Onde a nova rota da API residirá.
- `frontend/src/pages/Dashboard.tsx` - Onde o feed principal será exibido.
</canonical_refs>

<code_context>
## Insights do Código Existente

### Frontend
- O dashboard atual exibe uma lista de atividades estática que serve de mockup. Esta lista será substituída pelo novo componente dinâmico.

### Backend
- Os dados serão mesclados na memória no serviço backend após recuperar as N entidades mais recentes de cada tabela, e ordenados cronologicamente antes de enviar ao front-end. O isolamento de multi-tenant pelo `clinicId` permanece mandatório nas queries de busca de todas as entidades.
</code_context>

<deferred>
## Ideias Postergadas (Fora de Escopo)
- Criação de uma tabela `ActivityLog` ou `AuditLog` no banco de dados.
- Mecanismos avançados como "Interceptors" ou um "Complex Audit Engine".
- Rastreamento de diffs (estado antes/depois ou before/after tracking).
- Funcionalidade avançada de busca nos logs de auditoria.
- Exportação de dados (CSV, relatórios de atividades).
- Auditorias com níveis de "compliance" estritos.
</deferred>

---
*Fase 12: Clinic activity feed*
*Contexto atualizado em: 2026-05-26 com requisitos pragmáticos e simplificados.*
