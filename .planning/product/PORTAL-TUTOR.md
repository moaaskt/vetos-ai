# Portal do Tutor — Design Document

> **Status:** Rascunho
> **Fase relacionada:** 16B.1.2.1 (sem plano definido)
> **Última atualização:** 2026-06-26

---

## 1. Visão Geral

O **Portal do Tutor** é um módulo self-service voltado para os tutores (donos de pets), permitindo que interajam com a clínica veterinária de forma autônoma, sem depender de ligações telefônicas ou visitas presenciais.

**Proposta de valor:** Empoderar o tutor com acesso direto ao histórico clínico dos seus pets, agendamentos, documentos e comunicação com a clínica — 24 horas por dia, 7 dias por semana.

### 1.1. Diferencial Competitivo

A maioria esmagadora dos sistemas veterinários no Brasil é centrada exclusivamente na clínica (back-office). Não existe um portal voltado ao tutor com qualidade de produto. O VetOS AI será **o primeiro sistema veterinário brasileiro com portal do tutor integrado de forma nativa**, posicionando-se como referência em experiência do cliente final.

---

## 2. Funcionalidades Core

### 2.1. Autenticação do Tutor

| Aspecto | Detalhes |
|---|---|
| **Público-alvo** | Tutores cadastrados (model `Client`) |
| **Separação de auth** | Auth completamente separada do admin da clínica |
| **Dados existentes** | CPF, endereço, contatos já armazenados no `Client` |
| **Identificador** | CPF ou e-mail do tutor |

**Estratégias de autenticação (por ordem de prioridade):**

1. **Magic Link (recomendado para MVP):**
   - Tutor informa e-mail ou celular cadastrado
   - Recebe link de acesso temporário (via e-mail ou WhatsApp)
   - Sem fricção de senha, ideal para público não-técnico
   - Integração direta com o sistema de notificações existente

2. **Login com senha (fase posterior):**
   - Cadastro de senha pelo tutor após primeiro acesso via magic link
   - Recuperação de senha via e-mail/WhatsApp

3. **Login social (avaliação futura):**
   - Google OAuth
   - Apple Sign-In
   - Baixa prioridade: público veterinário brasileiro tem baixa adoção

### 2.2. Histórico Clínico do Pet (Leitura)

- **Timeline clínica completa** do pet em formato cronológico
- Visualização read-only de:
  - Consultas realizadas (data, veterinário, notas)
  - Diagnósticos registrados
  - Exames solicitados e resultados
  - Procedimentos realizados
  - Peso e medições ao longo do tempo
- **Não inclui:** notas internas do veterinário marcadas como privadas
- **Fonte de dados:** Derivado do `PetDetails.tsx` (monolito de 100KB que contém o prontuário completo)

### 2.3. Termos de Consentimento

- Visualizar termos de consentimento pendentes e assinados
- **Assinar termos digitalmente** pelo portal
- Reutiliza a infraestrutura existente:
  - `ConsentTerm` com campos: `tutorSigned`, `tutorSignedAt`, `tutorSignatureName`, `tutorSignatureCpf`, `tutorSignatureIp`, `tutorSignatureUserAgent`
  - `PublicDocumentView.tsx` já implementa visualização pública e assinatura
- Histórico de todos os termos assinados com comprovantes

### 2.4. Prescrições e Documentos

- Visualizar prescrições emitidas pelo veterinário
- Download de documentos em PDF (receitas, laudos, atestados)
- Compartilhamento via link (para farmácias, outros profissionais)
- Notificação quando novo documento é disponibilizado

### 2.5. Agendamento de Consultas

- **Agendar novas consultas** selecionando:
  - Pet (caso tenha múltiplos)
  - Tipo de serviço (consulta, vacina, retorno, banho, etc.)
  - Data e horário disponíveis
  - Veterinário preferido (opcional)
- **Reagendar/cancelar** consultas existentes (com política de antecedência da clínica)
- Visualizar histórico de agendamentos
- Integração com o módulo de scheduling existente no backend

### 2.6. Calendário de Vacinas e Lembretes

- Calendário visual com vacinas aplicadas e próximas doses
- Alertas automáticos:
  - Vacina vencendo (7 dias, 3 dias, no dia)
  - Reforço necessário
  - Vermífugo periódico
- Integração com o sistema de vaccine records existente
- Canais de notificação: push (futuro), e-mail, WhatsApp

### 2.7. Comunicação com a Clínica

- **Central de mensagens** entre tutor e clínica
- Notificações de:
  - Confirmação de agendamento
  - Lembrete de consulta (D-1, H-2)
  - Resultados de exames disponíveis
  - Campanhas e promoções da clínica
- Integração com o sistema de notificações existente (e-mail + WhatsApp)

### 2.8. Gestão de Perfil

- Atualizar dados de contato (telefone, e-mail, WhatsApp)
- Atualizar endereço
- Gerenciar preferências de notificação
- Visualizar dados de faturamento (futuro)

### 2.9. Perfil dos Pets

- Visualizar perfil completo de cada pet:
  - Foto, nome, espécie, raça, idade, peso
  - Alergias e condições crônicas
  - Veterinário responsável
- **Não permite edição** de dados clínicos (somente a clínica altera)
- Possibilidade de atualizar foto do pet

---

## 3. Considerações Técnicas

### 3.1. Arquitetura — Decisão Pendente

**Opção A: Route group dentro do app existente (recomendado para MVP)**

```
frontend/
├── src/
│   ├── app/              # Admin da clínica (existente)
│   └── tutor/            # Portal do tutor (novo route group)
│       ├── layout.tsx
│       ├── login/
│       ├── dashboard/
│       ├── pets/
│       ├── appointments/
│       └── documents/
```

- **Prós:** Reutiliza componentes, build único, menor overhead de manutenção
- **Contras:** Risco de acoplamento, bundle maior

**Opção B: Aplicação frontend separada**

```
tutor-portal/            # App separado
├── src/
│   ├── pages/
│   ├── components/
│   └── services/
```

- **Prós:** Isolamento total, deploy independente, bundle otimizado
- **Contras:** Duplicação de componentes, manutenção de dois projetos

> **Recomendação:** Iniciar com Opção A (route group) no MVP e migrar para app separado se a complexidade justificar.

### 3.2. API — Endpoints com Escopo do Tutor

Os endpoints do portal do tutor **não devem reutilizar** os endpoints admin existentes. Precisam de escopo próprio:

```
# Autenticação
POST   /api/tutor/auth/magic-link      # Solicitar magic link
POST   /api/tutor/auth/verify           # Verificar token do magic link
POST   /api/tutor/auth/logout           # Encerrar sessão

# Perfil
GET    /api/tutor/profile               # Dados do tutor
PATCH  /api/tutor/profile               # Atualizar dados de contato
GET    /api/tutor/pets                   # Listar pets do tutor
GET    /api/tutor/pets/:id              # Detalhes de um pet

# Histórico clínico (read-only)
GET    /api/tutor/pets/:id/timeline     # Timeline clínica
GET    /api/tutor/pets/:id/vaccines     # Calendário de vacinas

# Documentos
GET    /api/tutor/documents             # Listar documentos
GET    /api/tutor/documents/:id         # Visualizar documento
GET    /api/tutor/consent-terms         # Termos pendentes/assinados
POST   /api/tutor/consent-terms/:id/sign  # Assinar termo

# Agendamentos
GET    /api/tutor/appointments          # Listar agendamentos
POST   /api/tutor/appointments          # Criar agendamento
PATCH  /api/tutor/appointments/:id      # Reagendar
DELETE /api/tutor/appointments/:id      # Cancelar
GET    /api/tutor/available-slots       # Horários disponíveis

# Comunicação
GET    /api/tutor/notifications         # Notificações
GET    /api/tutor/messages              # Mensagens com a clínica
POST   /api/tutor/messages              # Enviar mensagem
```

### 3.3. Controle de Acesso a Dados

- **Princípio fundamental:** Tutor vê **somente** dados dos seus próprios pets
- Todos os queries filtrados por `clientId` do tutor autenticado
- Middleware de autorização em todas as rotas `/api/tutor/*`
- Notas internas do veterinário (`isPrivate: true`) nunca expostas
- Dados financeiros da clínica nunca expostos
- Audit log de todos os acessos do tutor

### 3.4. Design Mobile-First

- **Público-alvo primário:** tutores acessando pelo celular
- Layout responsivo com breakpoints: mobile (320px) → tablet (768px) → desktop (1024px)
- Touch-friendly: botões mínimo 44x44px, espaçamento generoso
- PWA (Progressive Web App) para experiência app-like no celular
- Possibilidade futura de app nativo (React Native) se volume justificar

---

## 4. Dependências em Módulos Existentes

| Módulo Existente | Dependência | Detalhes |
|---|---|---|
| `Client` (model) | CPF, contatos, endereço | Base de dados do tutor |
| `ConsentTerm` | Campos de assinatura digital | Fluxo de assinatura já implementado |
| `PublicDocumentView.tsx` | Visualização pública de documentos | Pode ser reutilizado/adaptado |
| Notification System | E-mail + WhatsApp | Magic link, lembretes, alertas |
| Scheduling | Agendamentos | Disponibilidade, criação de agendamentos |
| Vaccine Records | Registro de vacinas | Calendário e lembretes |
| `PetDetails.tsx` | Prontuário clínico | Fonte de dados para timeline (read-only) |

---

## 5. Fases de Implementação

### Fase 1 — MVP (4-6 semanas)

- [ ] Autenticação via magic link (e-mail)
- [ ] Dashboard básico com lista de pets
- [ ] Visualização do perfil do pet
- [ ] Visualização de vacinas aplicadas
- [ ] Visualização e assinatura de termos de consentimento

**Critério de sucesso:** Tutor consegue logar, ver seus pets e assinar termos sem intervenção da clínica.

### Fase 2 — Histórico e Documentos (3-4 semanas)

- [ ] Timeline clínica do pet (read-only)
- [ ] Visualização de prescrições
- [ ] Download de documentos em PDF
- [ ] Notificações por e-mail de novos documentos

**Critério de sucesso:** Tutor tem visibilidade completa do histórico clínico e documentos.

### Fase 3 — Agendamento (3-4 semanas)

- [ ] Visualizar agendamentos futuros
- [ ] Agendar nova consulta (seleção de serviço, data, horário)
- [ ] Reagendar e cancelar
- [ ] Lembretes automáticos (e-mail + WhatsApp)

**Critério de sucesso:** Tutor agenda e gerencia consultas de forma autônoma.

### Fase 4 — Comunicação e Calendário (3-4 semanas)

- [ ] Calendário de vacinas com alertas
- [ ] Central de mensagens tutor-clínica
- [ ] Preferências de notificação
- [ ] Gestão completa de perfil

**Critério de sucesso:** Portal completo com todas as funcionalidades core operacionais.

### Fase 5 — PWA e Polimento (2-3 semanas)

- [ ] PWA com install prompt
- [ ] Notificações push
- [ ] Otimização de performance
- [ ] Onboarding guiado para novos tutores
- [ ] Magic link via WhatsApp

---

## 6. Métricas de Sucesso

| Métrica | Meta MVP | Meta 6 meses |
|---|---|---|
| Tutores com primeiro acesso | 30% dos cadastrados | 60% dos cadastrados |
| Termos assinados pelo portal | 20% do total | 50% do total |
| Agendamentos pelo portal | — | 25% do total |
| NPS do portal | > 7 | > 8.5 |
| Redução de ligações à clínica | — | -30% |

---

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Tutores não adotam o portal | Média | Alto | Onboarding assistido pela clínica, magic link simplificado |
| Exposição de dados sensíveis | Baixa | Crítico | Middleware de autorização robusto, audit log, testes de segurança |
| Sobrecarga de agendamentos online | Baixa | Médio | Clínica configura % de slots online vs presencial |
| `PetDetails.tsx` difícil de decompor | Alta | Médio | Criar API de timeline independente, não depender do componente frontend |

---

## 8. Referências

- Fase 16B.1.2.1 no ROADMAP (sem plano definido)
- `PublicDocumentView.tsx` — implementação existente de visualização pública
- `ConsentTerm` — model com campos de assinatura digital do tutor
- Sistema de notificações (e-mail + WhatsApp) — backend existente
