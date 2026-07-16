# VetOS AI — Visão de Produto

> **Versão:** 1.0  
> **Data:** 2026-06-26  
> **Status:** Ativo  
> **Classificação:** Estratégico — Investidores & Stakeholders

---

## 1. Declaração de Missão

**Transformar a gestão veterinária no Brasil por meio de tecnologia inteligente, automação clínica e experiências digitais que conectam clínicas, profissionais e tutores em uma plataforma única, segura e escalável.**

O VetOS AI existe para resolver um problema estrutural do mercado veterinário brasileiro: a fragmentação operacional. Clínicas ainda operam com processos manuais, comunicação desconexa com tutores, prontuários em papel e zero inteligência sobre seus próprios dados. O VetOS AI substitui essa realidade por um sistema operacional veterinário completo — do agendamento à prescrição digital, da automação vacinal à assinatura eletrônica de termos — tudo com isolamento multi-tenant e preparado para inteligência artificial.

---

## 2. Mercado-Alvo

### 2.1 Segmentação Primária

| Segmento | Perfil | Tamanho Estimado | Prioridade |
|---|---|---|---|
| **Clínicas veterinárias** | 1–10 veterinários, atendimento geral e especializado | ~50.000 estabelecimentos no Brasil | 🔴 Alta |
| **Petshops com consultório** | Banho/tosa + atendimento veterinário integrado | ~35.000 estabelecimentos | 🟡 Média |
| **Hospitais veterinários** | 10+ veterinários, múltiplas especialidades, internação | ~5.000 estabelecimentos | 🟡 Média |
| **Redes e franquias** | Múltiplas unidades sob gestão centralizada | ~500 redes | 🟢 Futura |

### 2.2 Personas Principais

| Persona | Necessidades Críticas |
|---|---|
| **Veterinário(a) proprietário(a)** | Gestão financeira, visão operacional, redução de no-shows, fidelização de tutores |
| **Veterinário(a) clínico(a)** | Prontuário eletrônico ágil, histórico completo do paciente, prescrições digitais |
| **Recepcionista / Staff** | Agendamento eficiente, cadastro rápido, comunicação com tutores |
| **Tutor do pet** | Acesso ao histórico do animal, lembretes de vacinação, assinatura digital de documentos |

### 2.3 Contexto de Mercado

- O mercado pet brasileiro é o **3º maior do mundo**, com faturamento superior a **R$ 67 bilhões/ano** (2025).
- A digitalização do setor veterinário está **abaixo de 15%** — a maioria das clínicas ainda usa planilhas ou cadernos.
- A demanda por **telemedicina veterinária**, **prescrições digitais** e **comunicação automatizada** acelerou pós-pandemia.
- Regulamentações do CFMV (Conselho Federal de Medicina Veterinária) estão se movendo em direção à **obrigatoriedade de prontuários eletrônicos**.

---

## 3. Proposta de Valor

### Para a Clínica
> _"Um sistema operacional completo que automatiza sua rotina clínica, reduz faltas, aumenta receita recorrente e transforma dados em decisões — sem precisar de múltiplas ferramentas."_

### Para o Veterinário
> _"Prontuário eletrônico inteligente com timeline clínica, protocolos vacinais automatizados, prescrições digitais e histórico completo do paciente — tudo em um clique."_

### Para o Tutor
> _"Acompanhe a saúde do seu pet, receba lembretes de vacinas, assine documentos pelo celular e tenha acesso ao histórico médico completo — sem precisar ligar para a clínica."_

### Diferenciadores-Chave

```
┌─────────────────────────────────────────────────────────────┐
│                    PROPOSTA DE VALOR                        │
├─────────────────────────────────────────────────────────────┤
│  🏥 Gestão Clínica Completa                                │
│     Agenda → Prontuário → Prescrição → Assinatura Digital  │
│                                                             │
│  🤖 Automação Inteligente                                  │
│     Lembretes • Protocolos Vacinais • Notificações          │
│                                                             │
│  🔒 Segurança & Conformidade                               │
│     Multi-tenant • Criptografia • LGPD-ready               │
│                                                             │
│  📊 Dados & Inteligência                                   │
│     Dashboard • Analytics • Feed de Atividades              │
│                                                             │
│  📱 Experiência do Tutor                                   │
│     Documentos Públicos • Aceite Digital • WhatsApp         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Pilares de Produto

### Pilar 1: Gestão Clínica (`Clinical Management`)

O núcleo operacional da plataforma. Cobre todo o ciclo de vida do atendimento veterinário.

| Capacidade | Status | Descrição |
|---|---|---|
| Cadastro de Clientes & Pets | ✅ Implementado | CRUD completo com vínculo tutor-animal |
| Agenda de Consultas | ✅ Implementado | Calendário com status, filtros e visualização por período |
| Prontuário Eletrônico | ✅ Implementado | Timeline clínica, registros clínicos, anexos |
| Registro de Alergias | ✅ Implementado | Histórico de alergias por pet |
| Controle de Peso | ✅ Implementado | Histórico de pesagens com tracking temporal |
| Prescrições Digitais | ✅ Implementado | Geração, assinatura digital e visualização pública |
| Termos de Consentimento | ✅ Implementado | Templates, geração, assinatura e aceite do tutor |
| Internação & Cirurgias | 🔲 Planejado | Controle de leitos, centro cirúrgico |
| Estoque & Farmácia | 🔲 Planejado | Controle de medicamentos e insumos |

### Pilar 2: Automação (`Automation`)

Redução de trabalho manual e aumento de eficiência operacional.

| Capacidade | Status | Descrição |
|---|---|---|
| Engine de Automação Vacinal | ✅ Implementado | Protocolos com doses, intervalos e agendamento automático |
| Notificações por Email (SMTP) | ✅ Implementado | Templates configuráveis com envio automatizado |
| Notificações por WhatsApp | ✅ Implementado | Integração Evolution API com templates |
| Scheduler de Tarefas | ✅ Implementado | BullMQ para processamento assíncrono |
| Lembretes de Consulta | 🔲 Planejado | Notificação automática antes da consulta |
| Automação de Retornos | 🔲 Planejado | Sugestão de retorno baseada em protocolo |

### Pilar 3: Cuidado Assistido por IA (`AI-Assisted Care`)

Inteligência artificial aplicada ao contexto veterinário — o diferencial estratégico de longo prazo.

| Capacidade | Status | Descrição |
|---|---|---|
| Sugestão de Diagnóstico | 🔲 Planejado | IA analisa sintomas e sugere diagnósticos diferenciais |
| Geração de Prescrição | 🔲 Planejado | IA sugere medicamentos com base no diagnóstico e perfil do pet |
| Análise de Exames | 🔲 Planejado | Interpretação automática de hemogramas e bioquímicos |
| Chatbot para Tutores | 🔲 Planejado | Triagem inteligente de urgência via WhatsApp |
| Insights Clínicos | 🔲 Planejado | Detecção de padrões (ex: aumento de dermatites no verão) |
| Resumo Automático de Prontuário | 🔲 Planejado | IA gera resumo executivo do histórico do paciente |

### Pilar 4: Monetização SaaS (`SaaS Monetization`)

Modelo de receita recorrente com planos escaláveis.

| Capacidade | Status | Descrição |
|---|---|---|
| Planos de Assinatura | ✅ Parcial | Entidades Plan e ClinicSubscription existem no schema |
| Controle de Features por Plano | 🔲 Planejado | Feature flags baseadas no plano contratado |
| Integração de Pagamento | 🔲 Planejado | Stripe ou gateway nacional (Pagar.me, Asaas) |
| Trial Gratuito | 🔲 Planejado | Período de teste com conversão automatizada |
| Métricas de Churn & MRR | 🔲 Planejado | Dashboard financeiro para gestão SaaS |
| Marketplace de Integrações | 🔲 Futuro | Ecossistema de plugins e integrações de terceiros |

### Pilar 5: Experiência do Tutor (`Tutor Experience`)

Portal e touchpoints digitais para o dono do animal.

| Capacidade | Status | Descrição |
|---|---|---|
| Visualização Pública de Documentos | ✅ Implementado | Prescrições e termos acessíveis via link público |
| Aceite Digital de Termos | ✅ Implementado | Assinatura digital pelo tutor via link |
| Notificações WhatsApp | ✅ Implementado | Comunicação direta com o tutor |
| Portal do Tutor | 🔲 Planejado | Área logada com histórico completo do pet |
| Agendamento Online | 🔲 Planejado | Tutor agenda consultas diretamente |
| Carteira de Vacinação Digital | 🔲 Planejado | QR Code com histórico vacinal verificável |

---

## 5. Diferenciação Competitiva

### 5.1 Mapa Competitivo

| Dimensão | VetOS AI | SimplesVet | GuruVet | Vetwork | Vet Digital |
|---|---|---|---|---|---|
| **Prontuário Eletrônico** | ✅ Timeline clínica | ✅ Básico | ✅ Básico | ❌ | ✅ Básico |
| **Automação Vacinal** | ✅ Engine com protocolos | 🟡 Manual | ❌ | ❌ | 🟡 Manual |
| **Prescrição Digital c/ Assinatura** | ✅ Nativo | 🟡 Parcial | ❌ | ❌ | ❌ |
| **Termos de Consentimento Digital** | ✅ Com aceite do tutor | ❌ | ❌ | ❌ | ❌ |
| **WhatsApp Nativo** | ✅ Evolution API | 🟡 Terceiros | ❌ | ❌ | 🟡 Terceiros |
| **Multi-tenant Isolado** | ✅ Row-level | ✅ | 🟡 | ❌ | 🟡 |
| **Analytics Dashboard** | ✅ Nativo | 🟡 Básico | ❌ | ❌ | ❌ |
| **IA Clínica** | 🔲 Roadmap | ❌ | ❌ | ❌ | ❌ |
| **API Aberta** | 🔲 Roadmap | ❌ | ❌ | ✅ | ❌ |
| **Portal do Tutor** | 🔲 Roadmap | 🟡 Básico | ❌ | ❌ | ❌ |

### 5.2 Vantagens Competitivas Sustentáveis

1. **Stack Moderna e Escalável** — Monorepo NestJS + React + Prisma permite iteração rápida e manutenibilidade. Concorrentes operam com stacks legadas (PHP, monolitos acoplados).

2. **Automação Nativa** — Engine de protocolos vacinais, scheduler assíncrono e notificações multicanal integrados desde o core, não como plugins ou integrações tardias.

3. **Documentos Digitais Completos** — Prescrições e termos de consentimento com assinatura digital e aceite público são funcionalidades que nenhum concorrente direto oferece nativamente.

4. **Arquitetura AI-Ready** — O design do schema e da API já contempla os dados estruturados necessários para modelos de IA clínica (timeline, alergias, peso, vacinas, diagnósticos).

5. **Comunicação Multicanal Integrada** — Email SMTP e WhatsApp (Evolution API) com templates configuráveis por clínica, eliminando a necessidade de ferramentas externas.

6. **Multi-Tenant com Isolamento Real** — Cada clínica opera em total isolamento de dados, com `clinicId` enforced em todas as queries — requisito crítico para redes e franquias.

---

## 6. Visão de Longo Prazo (2026–2029)

### Horizonte 1: Fundação (2026 H2) — _"Clínica Digital Completa"_

**Objetivo:** Entregar uma plataforma SaaS completa que substitua 100% dos processos manuais de uma clínica veterinária de pequeno/médio porte.

```
Foco:
├── Estabilização e polimento das features existentes
├── Integração de pagamento (Stripe / gateway nacional)
├── Portal do Tutor (v1) — histórico e agendamento
├── Feature flags por plano de assinatura
├── Rate limiting, monitoramento e observabilidade
├── Onboarding automatizado (trial → conversão)
└── Primeiros 50 clientes pagantes
```

**Métrica-chave:** 50 clínicas ativas, MRR > R$ 15.000

### Horizonte 2: Inteligência (2027) — _"Veterinário Aumentado"_

**Objetivo:** Introduzir IA como diferencial competitivo irreplicável, assistindo o veterinário em decisões clínicas e automatizando tarefas cognitivas.

```
Foco:
├── IA para sugestão de diagnóstico diferencial
├── Geração inteligente de prescrições
├── Interpretação automática de exames laboratoriais
├── Resumo automático de prontuário (para referências e internações)
├── Chatbot de triagem para tutores (WhatsApp)
├── Telemedicina veterinária (videochamada integrada)
└── Expansão para hospitais veterinários e redes
```

**Métrica-chave:** 500 clínicas ativas, MRR > R$ 200.000, NPS > 60

### Horizonte 3: Ecossistema (2028–2029) — _"Plataforma Veterinária Nacional"_

**Objetivo:** Tornar o VetOS AI a plataforma de referência do setor veterinário brasileiro, com efeitos de rede entre clínicas, tutores, laboratórios e fornecedores.

```
Foco:
├── Marketplace de integrações (laboratórios, fornecedores, seguros pet)
├── API aberta para desenvolvedores terceiros
├── Rede de referência entre clínicas (encaminhamentos inter-clínicas)
├── Dados anonimizados para pesquisa epidemiológica veterinária
├── Expansão LATAM (Colômbia, México, Argentina)
├── Carteira de vacinação digital nacional (parceria CFMV)
└── IPO readiness / Series A
```

**Métrica-chave:** 5.000+ clínicas, ARR > R$ 15M, presença em 3+ países

---

## 7. Métricas de Sucesso & KPIs

### 7.1 KPIs de Produto

| Métrica | Definição | Meta H2/2026 | Meta 2027 |
|---|---|---|---|
| **Clínicas Ativas** | Clínicas com ≥1 login nos últimos 30 dias | 50 | 500 |
| **DAU/MAU Ratio** | Engajamento diário vs. mensal | > 40% | > 50% |
| **Consultas Registradas/Mês** | Volume de atendimentos na plataforma | 2.000 | 50.000 |
| **Prescrições Digitais/Mês** | Prescrições geradas e assinadas | 500 | 15.000 |
| **Taxa de Adoção do WhatsApp** | Clínicas com WhatsApp configurado | > 60% | > 80% |
| **NPS** | Net Promoter Score | > 40 | > 60 |

### 7.2 KPIs de Negócio

| Métrica | Definição | Meta H2/2026 | Meta 2027 |
|---|---|---|---|
| **MRR** | Receita Mensal Recorrente | R$ 15.000 | R$ 200.000 |
| **ARR** | Receita Anual Recorrente | R$ 180.000 | R$ 2.400.000 |
| **Churn Mensal** | Cancelamentos / Base ativa | < 5% | < 3% |
| **CAC** | Custo de Aquisição por Cliente | < R$ 500 | < R$ 400 |
| **LTV** | Lifetime Value | > R$ 3.000 | > R$ 8.000 |
| **LTV/CAC** | Eficiência de aquisição | > 6x | > 20x |
| **ARPU** | Receita Média por Clínica | R$ 300/mês | R$ 400/mês |

### 7.3 KPIs de Engenharia

| Métrica | Definição | Meta |
|---|---|---|
| **Uptime** | Disponibilidade da plataforma | > 99.5% |
| **P95 Latency** | Latência no percentil 95 | < 500ms |
| **Deploy Frequency** | Frequência de deploys em produção | > 2x/semana |
| **MTTR** | Tempo médio de recuperação de incidentes | < 2 horas |
| **Test Coverage** | Cobertura de testes automatizados | > 70% |
| **Security Incidents** | Incidentes de segurança por trimestre | 0 |

---

## 8. Princípios de Produto

1. **Clínica em Primeiro Lugar** — Toda feature deve resolver um problema real de uma clínica veterinária. Se não reduz trabalho manual, não aumenta receita ou não melhora o cuidado animal, não entra no roadmap.

2. **Automação > Notificação** — Não basta lembrar; o sistema deve agir. Protocolos vacinais geram agendamentos automaticamente, não apenas alertas.

3. **Dados como Ativo** — Cada interação gera dado estruturado. O schema é desenhado para alimentar modelos de IA desde o dia zero.

4. **Segurança Inegociável** — Multi-tenant com isolamento por `clinicId`, criptografia de dados sensíveis, RBAC granular e compliance LGPD não são features opcionais — são requisitos fundacionais.

5. **Experiência Premium** — A interface deve transmitir confiança e profissionalismo. Veterinários confiam seu negócio ao sistema; a UX deve refletir essa responsabilidade.

6. **Ecossistema Aberto** — A plataforma cresce quando integra com o ecossistema (laboratórios, fornecedores, gateways de pagamento). APIs e webhooks são cidadãos de primeira classe.

---

> **Próximos passos:** Consultar [ARCHITECTURE.md](file:///home/moa-dev/projetos/vetos-ai/.planning/product/ARCHITECTURE.md) para visão técnica detalhada e [ROADMAP.md](file:///home/moa-dev/projetos/vetos-ai/.planning/ROADMAP.md) para o plano de execução fase a fase.
