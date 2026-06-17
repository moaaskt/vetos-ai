---
status: completed
must_haves:
  truths:
    - Nenhuma rota, chave de API ou lógica de negócios é alterada.
    - Toda a interface exibe português do Brasil (PT-BR) com tom profissional de saúde animal.
  artifacts:
    - Layout, Login e Registro totalmente em português.
    - Telas do Tenant (Painel, Consultas, Pacientes, Clientes) com copywriting refinado.
    - Telas do Super Admin com vocabulário gerencial e de auditoria em português.
  key_links:
    - "002-CONTEXT.md": "alinhamento de termos e glossário"
    - "002-RESEARCH.md": "mapeamento de arquivos e salvaguardas de rotas/APIs"
---

# Quick Task 002 Plan: Tradução e Refinamento de Copywriting PT-BR

## Task 1: Tradução de Navegação, Layout e Telas de Acesso (`Layout`, `Login`, `Register`)
- **files:**
  - `frontend/src/components/Layout.tsx`
  - `frontend/src/pages/Login.tsx`
  - `frontend/src/pages/Register.tsx`
- **action:**
  - Em `Layout.tsx`: Traduzir itens do menu ("Painel", "Clientes", "Pacientes", "Consultas", "Métricas da Plataforma", "Gerenciar Clínicas"). Traduzir breadcrumbs e aviso de sessão de suporte.
  - Em `Login.tsx`: Mudar para "Acessar Sistema", "E-mail Profissional", "Senha", "Nova clínica? Cadastre sua unidade".
  - Em `Register.tsx`: Mudar para "Cadastrar Clínica", "Nome da clínica", "E-mail do administrador".
- **verify:**
  - Compilar o projeto com `npx tsc -b` para verificar ausência de erros de sintaxe.
- **done:**
  - [X] Shell de navegação e telas de login/cadastro estão 100% em português brasileiro.

## Task 2: Tradução e Copywriting das Telas Operacionais (`Dashboard`, `Appointments`, `Pets`, `Clients`)
- **files:**
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/Appointments.tsx`
  - `frontend/src/pages/Pets.tsx`
  - `frontend/src/pages/Clients.tsx`
- **action:**
  - Em `Dashboard.tsx`: Mudar seções para "Bem-vindo(a)", "Central Operacional", "Clientes Proprietários", "Pacientes Cadastrados", "Consultas Agendadas", "Atividade Recente da Clínica", "Resumo Operacional".
  - Em `Appointments.tsx`: Formatar exibição de status ("CONFIRMED" -> "Confirmado", etc.). Traduzir cabeçalhos e botões para "Atualizar Agenda", "Agendar Consulta".
  - Em `Pets.tsx` & `Clients.tsx`: Traduzir buscas, tabelas, modais de cadastro ("Cadastrar Paciente", "Tutor Responsável", etc.).
- **verify:**
  - Compilar e validar que chamadas `api.post` enviam os mesmos campos.
- **done:**
  - [X] Toda a operação de gestão de clínicas se comunica no padrão veterinário brasileiro.

## Task 3: Tradução do Painel Global Super Admin (`SuperAdminDashboard`, `SuperAdminClinics`)
- **files:**
  - `frontend/src/pages/super-admin/SuperAdminDashboard.tsx`
  - `frontend/src/pages/super-admin/SuperAdminClinics.tsx`
- **action:**
  - Em `SuperAdminDashboard.tsx`: Traduzir para "Controle Global da Plataforma", "Clínicas Ativas na Plataforma", "MRR Mensal Estimado", "Telemetria e Saúde do Sistema", "Acessar Contas de Clínicas".
  - Em `SuperAdminClinics.tsx`: Traduzir tabela para "Nome da Clínica", "UUID do Tenant", "Data de Cadastro", "Acessar como Clínica".
- **verify:**
  - Compilar o projeto com `npx tsc -b`.
- **done:**
  - [X] Painel de gestão global de tenants está totalmente localizado em português.
