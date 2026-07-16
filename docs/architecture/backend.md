# Backend Architecture

O backend do VetOS AI é desenvolvido em **NestJS** (um framework Node.js progressivo baseado em TypeScript). Ele fornece APIs seguras sob a arquitetura RESTful, organizadas modularmente por recursos.

## 1. Arquitetura Modular

O backend é organizado em módulos altamente desacoplados em `backend/src/`:

```text
src/
├── auth/            # Autenticação JWT, roles (RBAC) e personificação
├── prisma/          # Conexão e extensões de tenant com o banco de dados
├── clinics/         # Gestão cadastral de clínicas (tenants)
├── users/           # Usuários administrativos e profissionais das clínicas
├── clients/         # Gestão de tutores (clientes)
├── pets/            # Gestão de pacientes (pets)
├── appointments/    # Agendamento e fluxo de calendário
├── dashboard/       # Feeds de atividades e totalizadores operacionais
├── analytics/       # Consolidação estatística e métricas de saúde
├── notifications/   # Fila de mensageria (BullMQ), SMTP e Evolution API (WhatsApp)
├── scheduler/       # Motor cron de automações diárias (alertas vacinais)
└── tenant/          # Infraestrutura de AsyncLocalStorage para controle de tenants
```

## 2. Padrões Comuns

* **Controllers**: Tratam requisições HTTP, gerenciam validação primária de DTOs e mapeiam códigos de resposta HTTP.
* **Services**: Detêm a lógica de negócio e interagem com a camada de persistência.
* **Guards & Decorators**: Protegem endpoints com controle baseado em perfil de usuário (`@Roles('ADMIN')`) e extraem metadados (`@CurrentUser()`).
* **DTOs**: Validação estrita de payloads de entrada via `class-validator` e `class-transformer`.
* **Tenant Extension**: Interceptador nativo do ORM Prisma para injetar filtros de tenant automaticamente nas queries elegíveis.
