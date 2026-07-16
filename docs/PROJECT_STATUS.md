# Estado do Projeto - VetOS AI

Este documento detalha o estado atual do desenvolvimento do VetOS AI.

## Informações Gerais
* **Versão Atual**: `0.0.1`
* **Sprint Ativa**: Sprint 002 - Pets Complete Edit (Fase 16B.2)

## Funcionalidades Concluídas
* **Isolamento de Tenants (Multi-Tenancy)**: Contexto isolado por `AsyncLocalStorage` e propagação automática no Prisma ORM.
* **Autenticação & Controle de Acessos (RBAC)**: Login via JWT e níveis de permissões (`ADMIN`, `STAFF`, `SUPERADMIN`).
* **Gestão de Tutores (Clientes)**: CRUD com máscara de CPF única por clínica.
* **Portal de Prontuários (Timeline)**: Registro de evolução clínica, curva de peso, alergias, e imunização de pacientes.
* **Agenda & Calendário**: Planejamento e acompanhamento de consultas veterinárias de forma premium.
* **Central de Notificações**: SMTP para e-mails, integração com WhatsApp (Evolution API), encriptação de segredos e monitoramento de fila com BullMQ.
* **Assinatura & Aceite Digital de Termos**: Rota pública de termos com assinatura digital pelo CPF do tutor e auditoria de IP/User-Agent.

## Funcionalidades em Andamento
* **Sprint 002 (Edição de Pets)**: Implementação do fluxo completo de edição dos dados dos pets no frontend e no backend.

## Próximos Passos
* **Fase 15 (SaaS Billing & Limites)**: Checkout Stripe/Asaas e aplicação de cotas máximas do plano.
* **Fase 16A (Uploads de Anexos Clínicos)**: Upload de PDFs e imagens direto no prontuário.
* **Fase 16B.1.2 (Cadastro de Tutor Pós-Assinatura)**: Captação cadastral completa pública pós-termo.
* **Fase 16B.1.2.1 (Portal do Tutor B2C)**: Espaço exclusivo de login para tutores acessarem dados de saúde de seus animais.
* **Fase 17 (IA Copilot)**: Assistente virtual de diagnóstico de anamnese, previsão de no-show e mensagens automáticas contextuais.

## Possíveis Bloqueadores
* **WhatsApp API**: Dependência de instâncias externas de produção e Evolution API ativa. Atualmente utiliza um mock fallback de testes em dev.
