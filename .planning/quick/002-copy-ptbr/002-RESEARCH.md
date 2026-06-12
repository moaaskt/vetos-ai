# Quick Task 002: Tradução PT-BR e Copywriting - Pesquisa e Mapeamento

## 1. Mapeamento de Arquivos e Strings
Para garantir uma tradução profissional e imersiva para o ecossistema veterinário brasileiro sem afetar rotas ou payloads, os seguintes arquivos foram mapeados:

- `frontend/src/components/Layout.tsx`:
  - Itens de navegação: "Dashboard" -> "Painel", "Clients" -> "Clientes", "Pets" -> "Pacientes", "Appointments" -> "Consultas", "Platform Stats" -> "Métricas Gerais", "Manage Clinics" -> "Unidades Cadastradas".
  - Banner de Impersonation: "Active Impersonation Session" -> "Sessão de Suporte Ativa: Clínica ID".
  - Breadcrumbs e Contexto: "Platform Overview" -> "Visão Geral da Plataforma", "Workspace" -> "Ambiente de Trabalho", "Sign out" -> "Sair da Conta".

- `frontend/src/pages/Dashboard.tsx`:
  - Títulos: "Welcome back" -> "Bem-vindo(a) de volta", "command center" -> "Central Operacional".
  - Cartões e Métricas: "Total Registered Clients" -> "Clientes Proprietários", "Total Patient Pets" -> "Pacientes Cadastrados", "Scheduled Appointments" -> "Consultas Agendadas".
  - Atividades Recentes e Operação: "Recent Clinic Activity" -> "Atividade Recente da Clínica", "Live activity audit" -> "Auditoria em tempo real", "Workspace Summary" -> "Resumo Operacional".

- `frontend/src/pages/Appointments.tsx`:
  - Cabeçalho: "Live Schedule" -> "Agenda em Tempo Real", "Review upcoming patient consultations..." -> "Acompanhe as consultas, exames de rotina e procedimentos cirúrgicos agendados."
  - Mapeamento de Status (`getStatusText`): "CONFIRMED" -> "Confirmado", "SCHEDULED" -> "Agendado", "COMPLETED" -> "Concluído", "CANCELLED" -> "Cancelado".
  - Botões e Empty State: "Refresh List" -> "Atualizar Agenda", "No appointments scheduled" -> "Nenhuma consulta agendada".

- `frontend/src/pages/Pets.tsx`:
  - Cabeçalho e Botões: "Patients & Pets" -> "Pacientes Registrados", "Register Patient" -> "Cadastrar Paciente", "Medical Records" -> "Prontuários Médicos".
  - Filtro e Tabela: "Search by pet name..." -> "Pesquisar por nome do paciente, espécie, raça ou tutor...".
  - Modal: "Register New Patient Pet" -> "Cadastrar Novo Paciente", "Client / Owner" -> "Tutor Responsável", "Species" -> "Espécie (Ex: Cão, Felino)".

- `frontend/src/pages/Clients.tsx`:
  - Cabeçalho e Tabela: "Client Directory" -> "Diretório de Clientes", "Pet Owners" -> "Tutores de Pacientes", "Full Legal Name" -> "Nome Completo do Tutor".

- `frontend/src/pages/super-admin/SuperAdminDashboard.tsx` & `SuperAdminClinics.tsx`:
  - "Global Platform Control" -> "Controle Global da Plataforma", "Enrolled Tenant Clinics" -> "Clínicas Ativas na Plataforma", "Manage All Clinics" -> "Gerenciar Clínicas", "Login as Clinic" -> "Acessar como Clínica".

- `frontend/src/pages/Login.tsx` & `Register.tsx`:
  - "Sign in" -> "Acessar Sistema", "Create account" -> "Cadastrar Clínica", "Email" -> "E-mail Profissional", "Password" -> "Senha de Acesso".

## 2. Prevenção contra Falhas (Guardrails)
- Nenhum valor em `to="/..."` nos Links/NavLinks será modificado.
- Os corpos JSON das requisições `api.post('/pets', { ... })` manterão as chaves exatas em inglês.
