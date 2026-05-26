# Fase 12: Feed de Atividades da Clínica - Plano de Implementação

Este plano define os passos necessários para implementar o feed de atividades em tempo real no Dashboard, substituindo a lista estática e fornecendo dados reais do inquilino (tenant).

## Critérios de Aceitação (UAT)

1. **Endpoint `GET /dashboard/activity`**:
   - Requer autenticação por Token JWT.
   - Retorna as atividades operacionais mais recentes da clínica com escopo de tenant (`clinicId`).
   - Consolida registros reais de: agendamentos, clientes, pets, prontuários clínicos, alergias, vacinas e registros de peso.
   - Retorna os dados ordenados por data de criação de forma decrescente (`createdAt DESC`), limitados a um número prático (ex: 10 a 15 itens).
2. **Integração Frontend**:
   - Dashboard da Clínica exibe dados reais a partir do novo endpoint do backend.
   - Tratamento de estados de carregamento (Skeletons).
   - Rótulos informativos e amigáveis em **Português (PT-BR)** descrevendo exatamente qual evento ocorreu e o nome das entidades associadas (pet, tutor, etc.).
   - Componente de **Empty State** bonito e consistente caso não haja atividade registrada.
3. **Robustez e Segurança**:
   - Garantia de multi-tenant (nunca vazar atividades de uma clínica para outra).
   - Nenhuma nova tabela ou migração de banco de dados requerida.
   - Código seguro e otimizado com concorrência no backend (`Promise.all`).

## Tarefas por Componente

### 1. Backend: Dashboard Module

#### [MODIFY] [dashboard.controller.ts](file:///home/moadev/projetos/vetOSAI/backend/src/dashboard/dashboard.controller.ts)
- Adicionar o endpoint `GET /dashboard/activity` protegido pelo `JwtAuthGuard`.
- Obter o `clinicId` do usuário autenticado através do `@CurrentUser() user`.
- Chamar o método `getActivity(clinicId)` no `DashboardService`.

#### [MODIFY] [dashboard.service.ts](file:///home/moadev/projetos/vetOSAI/backend/src/dashboard/dashboard.service.ts)
- Implementar o método `getActivity(clinicId: string)`.
- Realizar consultas concorrentes com `Promise.all` para as seguintes tabelas, limitando a 10 registros por tabela, filtrando por `clinicId`:
  - `Client` (include `pets` ou apenas dados básicos)
  - `Pet` (include `client`)
  - `Appointment` (include `pet`, `client`)
  - `ClinicalRecord` (include `pet`)
  - `Allergy` (include `pet`)
  - `VaccineRecord` (include `pet`)
  - `WeightRecord` (include `pet`)
- Unificar e estruturar os dados na memória em um objeto padronizado contendo:
  - `id`: ID único da atividade/evento
  - `type`: O tipo de entidade
  - `text`: Descrição legível em português (PT-BR) da atividade
  - `date`: Data do evento (`createdAt`)
- Ordenar a lista mesclada de forma decrescente pela data e retornar as primeiras 10 atividades mais recentes.

### 2. Frontend: Dashboard UI

#### [MODIFY] [api.ts](file:///home/moadev/projetos/vetOSAI/frontend/src/lib/api.ts)
- Adicionar a tipagem para o item de atividade (`DashboardActivity`).

#### [MODIFY] [Dashboard.tsx](file:///home/moadev/projetos/vetOSAI/frontend/src/pages/Dashboard.tsx)
- Substituir o array estático `recentActivities` por um estado (`activities`) carregado via API.
- Buscar as atividades no `useEffect` de inicialização a partir do endpoint `/dashboard/activity`.
- Exibir Skeletons ou estado de carregamento apropriado enquanto as atividades são recuperadas.
- Tratar o estado de erro, exibindo uma mensagem de falha caso a API falhe.
- Renderizar a lista de forma rica, exibindo ícones e cores específicas para cada tipo de atividade de forma coerente com o design premium do VetOS AI.
- Exibir um lindo componente de **Empty State** caso a lista de atividades retorne vazia, orientando o usuário a criar novos registros.

## Plano de Verificação

### Testes Manuais de UI
- Cadastrar um novo cliente e verificar se o feed atualiza com a informação em PT-BR no Dashboard.
- Cadastrar um novo pet e verificar a listagem correspondente.
- Criar agendamentos, registrar pesos, vacinas e alergias e conferir a consolidação cronológica no Dashboard.
- Logar em outra clínica e garantir que o feed de atividades permaneça vazio ou isolado aos seus respectivos dados (teste de isolamento de inquilino/multi-tenant).
- Testar o comportamento da interface simulando um retorno vazio do backend (Empty State).
