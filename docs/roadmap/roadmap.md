# Roadmap Macro - VetOS AI

Este documento descreve as grandes fases e marcos estratégicos de evolução do ecossistema do VetOS AI.

## Fase 1: Setup do Projeto e Infraestrutura Core
* **Objetivo**: Inicialização do monorepo, banco de dados isolado e ambiente Docker de desenvolvimento.

## Fase 2: Modelagem, Segurança & Multi-tenancy
* **Objetivo**: Estrutura das entidades clínicas principais, controle de acesso RBAC e isolamento transparente de inquilinos na camada do ORM.

## Fase 3: Operações Básicas de Clínicas
* **Objetivo**: Cadastro e listagem (CRUD) de tutores, pacientes e agendamentos no backend.

## Fase 4: Motor de Automações & Notificações
* **Objetivo**: Fila em background de notificações para tutores integrando canais de E-mail (SMTP) e WhatsApp.

## Fase 5: Portal Administrativo (Web)
* **Objetivo**: Interface administrativa para controle operacional diário das clínicas.

## Fase 6: Prontuário Clínico Digital & Timeline de Pacientes
* **Objetivo**: Linha do tempo unificada do paciente trazendo registros de evolução, curva de peso, vacinação aplicada e alertas de alergias.

## Fase 7: Emissão de Documentos e Assinaturas Digitais
* **Objetivo**: Emissão de receitas médicas digitais e termos de consentimento cirúrgico/clínico com aceite eletrônico auditado do tutor.

## Fase 8: SaaS Billing & Monetização
* **Objetivo**: Cobrança automática recorrente das clínicas (Stripe/Asaas) e travas automáticas por limites do plano e inadimplência.

## Fase 9: Portal de Acesso do Tutor (B2C)
* **Objetivo**: Canal exclusivo para tutores de animais acompanharem o histórico médico e vacinas de seus pets.

## Fase 10: Inteligência Artificial (AI Copilot)
* **Objetivo**: Diagnósticos sugeridos por IA na anamnese, alertas de no-show e reengajamento inteligente de clientes ausentes.
