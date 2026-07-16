# Changelog - VetOS AI

Todas as alterações e melhorias técnicas implementadas no VetOS AI estão documentadas neste arquivo de forma cronológica.

## [0.0.1] - 2026-07-16

### Adicionado
* **Setup Inicial (Fase 1)**: Configuração do monorepo, banco de dados PostgreSQL, filas Redis e infraestrutura de containers via Docker Compose.
* **Core API & Modelagem (Fase 2)**: Modelos no Prisma ORM para Clínicas, Usuários, Tutores, Pets, Consultas, Agendamentos e Assinaturas de Planos.
* **Segurança & RBAC (Fase 2)**: Autenticação via tokens JWT, controle de acesso baseado em roles (ADMIN, STAFF, SUPERADMIN) e logs de personificação de suporte para Super Admin.
* **Isolamento de Tenants (Fase 2)**: Extensão do Prisma e middleware global NestJS baseado em `AsyncLocalStorage` para isolar dados entre clínicas.
* **Fichas Cadastrais (Fase 3)**: Endpoints REST e controllers para Clínicas, Usuários, Tutores e Pets.
* **Central de Notificações (Fase 4)**: Processamento de filas em segundo plano com BullMQ, disparos de e-mail por SMTP, testes de conexões, encriptação AES-256 e templates de mensagens.
* **Provedor Evolution API WhatsApp (Fase 4)**: Pareamento por QR Code, logs de auditoria e retry manual de notificações com fallback mockado.
* **Interface do Dashboard Admin (Fase 5)**: Login, fluxo de navegação e página inicial com totalizadores de atendimento e feed recente de auditoria.
* **Ajustes Premium de UI/UX (Fase 8)**: Sanctuary Design com oklch, skeletons para estados de carregamento e ilustrações customizadas para estados vazios.
* **Tema Claro/Escuro (Fase 9)**: Toggle no menu principal do dashboard com persistência em armazenamento local.
* **Calendário Veterinário Premium (Fase 10)**: Visualização dinâmica de agenda, alteração rápida de status de consultas e formulário integrado de criação.
* **Prontuário Médico & Timeline (Fase 11)**: Histórico de evolução clínica, evolução de peso, registro de alergias críticas e calendário vacinal.
* **Feed de Auditoria da Clínica (Fase 12)**: Logs consolidados de histórico de ações (criação, edição, exclusão) agrupados cronologicamente.
* **Módulo de Analytics Operacional (Fase 13)**: Alertas preventivos de vacinas próximas ao vencimento (D0 a D+7) com atalhos de contato para WhatsApp, e gráficos puros em CSS/HTML.
* **Motor Vacinal standalone (Fase 14A)**: Cron daily às 02:00 UTC-safe para disparos automáticos e deduplicação de jobs vacinais.
* **Aceite Digital de Termos (Fase 16B.1.1)**: Formulário público pós-assinatura com validação algorítmica de CPF do tutor e auditoria de IP, User-Agent e Data/Hora.
