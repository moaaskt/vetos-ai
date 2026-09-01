<div align="center">

# 🐾 VetOS AI
### Sistema Operacional & SaaS Multi-tenant para Clínicas Veterinárias

Plataforma completa de gestão clínica e hospitalar veterinária com isolamento lógico multi-tenant, prontuário eletrônico avançado, motor de automações/filas assíncronas e aceite digital de termos com trilha de auditoria.

---

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.x%20%2F%20BullMQ-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![SSL](https://img.shields.io/badge/SSL-Let's%20Encrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)](https://letsencrypt.org)

<br />

🌐 **Ambiente de Produção (Live Demo):** **[vetos.moadev.com.br](https://vetos.moadev.com.br)**

</div>

---

### 🔑 Credenciais de Demonstração Rápida (Ambiente Demo)

| Perfil / Papel | E-mail de Acesso | Senha Padrão | Escopo & Permissões |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@vetos.ai` | `Senha123!` | Visão global da plataforma, governança de tenants e impersonação. |
| **Admin da Clínica** | `admin@alfa.com` | `Senha123!` | Gestão completa da Clínica Alfa (Prontuários, Agenda, Equipe, Configurações). |
| **Equipe / Staff** | `staff@alfa.com` | `Senha123!` | Acesso operacional da Clínica Alfa (Atendimentos, Vacinas e Consultas). |
| **Clínica Isolada (Beta)**| `admin@beta.com` | `Senha123!` | Gestão do Hospital Veterinário Beta (Demonstração do isolamento de dados). |

---

## 🌟 Visão Geral & Destaques Arquiteturais

O **VetOS AI** foi projetado seguindo rigorosos padrões de engenharia de software corporativa, garantindo confiabilidade clínica, segurança de dados e alta performance sob condições de uso intenso:

* 🏢 **Arquitetura SaaS Multi-Tenant Nativa:**
  * Isolamento lógico rigoroso por `clinicId` em todas as camadas de persistência.
  * Injeção de contexto transparente via `AsyncLocalStorage` (`TenantContextService`).
  * Extensão Prisma customizada (`TenantPrismaExtension`) com modos configuráveis (`OFF`, `LOG`, `ENFORCE`) prevenindo vazamento acidental de dados entre clínicas.
* ⚡ **Motor de Filas & Automações em Background (BullMQ + Redis):**
  * Processamento assíncrono e resiliente para disparos de lembretes vacinais nas janelas estratégicas (**D0**, **D-1**, **D-7**).
  * Agendamento dinâmico de avisos prévios de consultas com suporte a cancelamento/remarcação atômica de jobs.
  * Proteção anti-spam e rastreabilidade através de `NotificationLog`.
* 🩺 **Prontuário Eletrônico & Gestão Clínica Avançada:**
  * Linha do tempo unificada de atendimentos, exames, vacinas, histórico de peso e alertas vitais (alergias graves).
  * Emissão de prescrições médicas estruturadas e termos de consentimento com QR Code de validação pública.
* ✍️ **Aceite & Assinatura Digital do Tutor:**
  * Fluxo público e responsivo para visualização, validação de CPF e assinatura eletrônica de termos pelo tutor.
  * Trilha de auditoria jurídica completa: captura de endereço IP, User-Agent do navegador, timestamp UTC e hash de integridade do documento.
* 🎨 **Design System *"The Clinical Sanctuary"*:**
  * Interface ergonomicamente planejada para reduzir a fadiga cognitiva sob iluminação hospitalar.
  * Suporte nativo a **Light / Dark Mode** com paletas em espaço de cor moderno **OKLCH** e conformidade **WCAG AA**.

---

## 🏗️ Diagrama de Arquitetura & Topologia de Infraestrutura

```
                                  [ Internet / Usuários ]
                                             │
                                     ( HTTPS / Port 443 )
                                             ▼
                        ┌────────────────────────────────────────┐
                        │    Nginx Proxy Manager (VPS Oracle)    │
                        │    Certificados SSL Let's Encrypt      │
                        └────────────────────┬───────────────────┘
                                             │
                    ┌────────────────────────┴────────────────────────┐
                    │                                                 │
            ( Proxy / :80 )                                   ( Proxy /api :3000 )
                    ▼                                                 ▼
        ┌───────────────────────┐                         ┌───────────────────────┐
        │  Nginx SPA (Frontend) │                         │  NestJS API (Backend) │
        │  React 19 + Vite      │                         │  Node.js 22 + Prisma  │
        │  Tailwind CSS v4      │                         │  Tenant Guard / Auth  │
        └───────────────────────┘                         └───────────┬───────────┘
                                                                      │
                                                ┌─────────────────────┴─────────────────────┐
                                                │                                           │
                                                ▼                                           ▼
                                    ┌───────────────────────┐                   ┌───────────────────────┐
                                    │     PostgreSQL 15     │                   │        Redis 7        │
                                    │   Schemas & Tenants   │                   │   BullMQ Job Queue    │
                                    │    Volume Persistente │                   │   Cache & Schedulers  │
                                    └───────────────────────┘                   └───────────────────────┘
```

### 🚀 Pipeline de CI/CD Automatizado (GitHub Actions)
* A cada `push` ou `merge` na branch `main`, o workflow [deploy.yml](file:///.github/workflows/deploy.yml) é disparado.
* Conexão segura via SSH com a VPS Oracle Cloud Ubuntu Server.
* Execução automatizada de `git pull`, reconstrução otimizada dos containers Docker via Compose e aplicação idempotente de migrações (`npx prisma migrate deploy`).

---

## 📂 Estrutura do Repositório

```text
vetos-ai/
├── backend/                  # API NestJS (TypeScript, Prisma, BullMQ, Auth, Multi-tenancy)
├── frontend/                 # SPA React 19 (Vite, Tailwind CSS, Lucide Icons, Contexts)
├── docs/                     # Repositório oficial de documentação e governança
│   ├── architecture/         # Decisões arquiteturais, DESIGN.md e AGENTS.md
│   ├── audits/               # Relatórios de auditoria clínica e técnica
│   ├── features/             # Especificações de produto e planos funcionais (PRODUCT.md)
│   └── decisions/            # Architecture Decision Records (ADRs)
├── .github/workflows/        # Pipelines de Integração e Deploy Contínuo (CI/CD)
├── docker-compose.yml        # Orquestração local e de produção dos serviços
└── README.md                 # Documento de apresentação do projeto
```

### 📚 Documentação Técnica de Governança
* 🎨 [DESIGN.md](file:///home/moa-dev/projetos/vetos-ai/docs/architecture/DESIGN.md) — Sistema de Design, tokens de cor OKLCH e princípios ergonômicos clínicos.
* 📦 [PRODUCT.md](file:///home/moa-dev/projetos/vetos-ai/docs/features/PRODUCT.md) — Visão do produto, personas, propósito e acessibilidade (WCAG AA).
* 📄 [CERTIFICATE_PDF_PLAN.md](file:///home/moa-dev/projetos/vetos-ai/docs/features/CERTIFICATE_PDF_PLAN.md) — Arquitetura para emissão de certificados vacinais em PDF com `pdfkit`.
* 💉 [VACCINE_MODULE_AUDIT.md](file:///home/moa-dev/projetos/vetos-ai/docs/audits/VACCINE_MODULE_AUDIT.md) — Auditoria técnica de conformidade para imunização e controle de lotes.

---

## 🛠️ Guia Rápido de Execução Local

### Pré-requisitos
* [Node.js](https://nodejs.org/) (v20 ou v22 recomendado)
* [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
* [Git](https://git-scm.com/)

---

### Passo a Passo

#### 1. Clonar o repositório
```bash
git clone https://github.com/moaaskt/vetos-ai.git
cd vetos-ai
```

#### 2. Configurar as variáveis de ambiente
Copie os modelos de configuração para criar o seu `.env`:
```bash
cp .env.example .env
```

#### 3. Subir a stack completa com Docker Compose
```bash
docker compose up -d --build
```
> O Docker iniciará os serviços:
> * **PostgreSQL**: `localhost:5432`
> * **Redis**: `localhost:6379`
> * **Backend NestJS**: `http://localhost:3000`
> * **Frontend SPA**: `http://localhost:5173` (ou porta configurada)

#### 4. Executar Migrações e Seeds do Banco de Dados
Para popular o banco com os dados de demonstração (Clínica Alfa, Beta, Tutores, Pacientes, Vacinas e Consultas):

```bash
# Executando o seed dentro do container backend
docker exec -it vetos_backend npm run seed:demo

# Ou alternativamente, em ambiente de desenvolvimento local na pasta backend:
cd backend
npx prisma migrate dev
npm run seed:demo
```

---

## 👨‍💻 Autor e Licença

Desenvolvido com foco em excelência arquitetural por **[moaaskt](https://github.com/moaaskt)**.

Distribuído sob a licença **MIT**. Consulte o arquivo de licença para mais informações.
