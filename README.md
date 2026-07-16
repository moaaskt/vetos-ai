<div align="center">

<img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge" />
<img src="https://img.shields.io/badge/versão-0.1.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/licença-MIT-green?style=for-the-badge" />

<br />
<br />

# 🐾 VetOS AI

### Sistema Operacional Inteligente para Clínicas Veterinárias

*Gestão clínica assistida por IA — prontuários, agendamentos e operações em tempo real.*

</div>

---

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Roadmap](#roadmap)
- [Autor](#autor)

---

## 💡 Sobre o Projeto

O **VetOS AI** é uma plataforma SaaS voltada para clínicas veterinárias e petshops, com o objetivo de centralizar toda a gestão operacional em um único lugar. O sistema oferece controle de pacientes, histórico clínico unificado, agenda de consultas, cadastro de tutores e métricas em tempo real — com integração planejada ao WhatsApp e assistência via IA.

O projeto nasceu da ideia de modernizar a gestão veterinária, substituindo planilhas e sistemas legados por uma solução moderna, responsiva e inteligente.

> ⚠️ **Projeto em desenvolvimento ativo.** Algumas features ainda estão sendo implementadas.

---

## ✨ Funcionalidades

### ✅ Implementadas

- **Painel Central** — visão geral da clínica com métricas de clientes, pacientes e consultas em tempo real
- **Agenda de Consultas** — visualização diária e semanal, busca por paciente/tutor/motivo, status (agendado, concluído, cancelado)
- **Fichas de Pacientes** — histórico clínico unificado com linha do tempo de consultas, alergias/alertas, vacinas aplicadas e histórico de peso
- **Cadastro de Clientes e Tutores** — vínculo entre tutor e animal, contatos e dados completos
- **Atividade Recente da Clínica** — feed de eventos com auditoria da equipe médica
- **Resumo Operacional** — status de backup, latência do gateway e integridade do sistema

### 🚧 Em Desenvolvimento

- Integração com WhatsApp Cloud API para notificações automáticas
- Assistente IA para sugestões clínicas e triagem
- Multi-tenancy (isolamento de dados por clínica)
- Sistema de filas com Redis para processamento assíncrono
- Módulo financeiro

---

## 🛠️ Tecnologias

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

### Backend
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)

### Banco de Dados e Infra
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

### Integrações Planejadas
![WhatsApp](https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura **monorepo** com separação clara entre frontend e backend:

```
vetos-ai/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # NestJS API (REST)
├── docker-compose.yml # PostgreSQL + Redis local
└── .planning/         # Documentação de planejamento (GSD Workflow)
```

**Decisões de arquitetura:**

- **NestJS com módulos** — inspirado em DDD (Domain-Driven Design), cada domínio (consultas, pacientes, clientes) tem seu próprio módulo
- **Multi-tenant** — estrutura planejada para isolar dados por clínica/petshop
- **Filas com Redis** — processamento assíncrono para mensagens WhatsApp e chamadas à IA
- **Prisma ORM** — migrations versionadas e tipagem end-to-end com TypeScript

---


## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Painel, Clientes, Pacientes, Consultas
│   ├── hooks/          # Custom hooks
│   └── services/       # Chamadas à API

backend/
├── src/
│   ├── modules/        # consultas, pacientes, clientes, auth
│   ├── common/         # guards, pipes, interceptors
│   └── main.ts
```

---

## 🗺️ Roadmap

- [x] Painel Central com métricas
- [x] Agenda de Consultas (visualização diária)
- [x] Fichas de Pacientes com histórico clínico
- [x] Cadastro de Clientes e Tutores
- [ ] Autenticação JWT com controle de perfis
- [ ] Integração WhatsApp Cloud API
- [ ] Assistente IA (triagem e sugestões clínicas)
- [ ] Multi-tenancy completo
- [ ] Módulo financeiro
- [ ] Deploy em produção (Railway / Vercel)

---

## 👨‍💻 Autor

Feito com dedicação por **[moaaskt](https://github.com/moaaskt)**

[![GitHub](https://img.shields.io/badge/GitHub-moaaskt-181717?style=flat-square&logo=github)](https://github.com/moaaskt)

---

<div align="center">
  <sub>⭐ Se esse projeto te inspirou, deixa uma estrela no repositório!</sub>
</div>
