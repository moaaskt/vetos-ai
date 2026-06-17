# Contexto de Decisão - Fase 4: Automação e Mensageria (Automation & Notifications Core)

Este documento registra as decisões de arquitetura e escopo acordadas para a **Fase 4** do VetOS AI. Ele serve como o guia definitivo para os subagentes de pesquisa e planejamento implementarem a solução sem ambiguidades.

---

## 🗺️ Divisão em Waves (Fases de Entrega)

Para garantir uma entrega incremental estável e robusta, a Fase 4 será dividida em 3 ondas (Waves):

### Wave 1: Fundação, Modelagem e Mock Providers
- **Modelagem de Dados (Prisma):** Criar os modelos para `NotificationConfig`, `NotificationTemplate` e `NotificationLog` com suporte a multi-tenant (`clinicId`).
- **Segurança:** Implementar criptografia simétrica (ex: AES-256-CBC ou GCM com chave mestra no `.env`) para chaves e senhas de API armazenadas na configuração.
- **Módulo de Mensageria:** Estruturar a fila `notifications` no BullMQ.
- **Provedores de Envio (Mocks e SMTP):**
  - Implementar o provedor de Email real via **SMTP** (`nodemailer` ou `@nestjs-modules/mailer` com carregamento dinâmico de credenciais por clínica).
  - Implementar um provedor Mock para WhatsApp (logando em console e salvando no histórico) que servirá de sandbox inicial.
- **Templates Dinâmicos:** Engine simples para substituição de placeholders (ex: `{{client_name}}`, `{{pet_name}}`, `{{appointment_time}}`) em templates de Email e WhatsApp.

### Wave 2: Automacões Veterinárias e Scheduler Escalável
- **Arquitetura Híbrida do Scheduler:**
  - **BullMQ Delayed Jobs:** Usado para eventos pontuais de tempo relativo (Consulta Criada, Lembrete 24h, Lembrete 2h, Retorno pós-atendimento). Quando um agendamento é criado/alterado, criamos delayed jobs únicos no BullMQ (com cancelamento automático de jobs antigos).
  - **Cron Jobs Diários:** Usado para varreduras de lote (Vacinas a vencer, Clientes inativos).
- **Implementação dos 6 Fluxos Veterinários:**
  1. **Consulta Criada:** Confirmação enviada imediatamente após agendamento.
  2. **Lembrete 24h:** Lembrete de consulta disparado exatamente 24 horas antes do compromisso.
  3. **Lembrete 2h:** Lembrete crítico disparado 2 horas antes do compromisso.
  4. **Vacina Próxima:** Alerta diário para vacinas que vencem nos próximos X dias.
  5. **Retorno Pós-Atendimento:** Follow-up enviado X dias após a consulta solicitando feedback.
  6. **Cliente Inativo:** Alerta diário para reengajar clientes com mais de 90 dias desde a última consulta (com prevenção de spam utilizando trava temporal).

### Wave 3: Integração Real com WhatsApp (Evolution API) e Painel Frontend de Observabilidade
- **Evolution API (WhatsApp):** Substituição do mock de WhatsApp por integração HTTP real com a Evolution API para disparo das mensagens.
- **Módulo Frontend de Observabilidade e Configuração (React):**
  - Tela de Configurações de Notificação (Configurar SMTP e Instância da Evolution API por clínica).
  - Tela de Gerenciamento de Templates (Personalização do assunto e corpo das mensagens para cada evento).
  - Painel de Histórico de Envios (Lista paginada de logs, status: `agendado`, `enviado`, `falhou`).
  - Ações operacionais no Frontend:
    - **Reenvio manual** de notificações com falha.
    - **Teste de conexão** com os provedores configurados.
    - **Teste de envio avulso** de mensagem para validar a configuração.

---

## 🏛️ Decisões de Arquitetura & Diretrizes de Design

### 1. Modelos de Banco de Dados (Prisma)
Os novos modelos no Prisma devem seguir estes contratos:

```prisma
model NotificationConfig {
  id                String   @id @default(uuid())
  clinicId          String   @unique
  clinic            Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  
  // SMTP Configs (Criptografados se sensíveis)
  smtpHost          String?
  smtpPort          Int?
  smtpSecure        Boolean  @default(true)
  smtpUser          String?
  smtpPass          String?  // Armazenado criptografado
  smtpFromEmail     String?
  smtpFromName      String?
  
  // WhatsApp Configs (Evolution API - Criptografados se sensíveis)
  waApiUrl          String?
  waApiKey          String?  // Armazenado criptografado
  waInstanceName    String?
  
  // Flags de Ativação por Evento
  enableApptCreated Boolean  @default(true)
  enableReminder24h Boolean  @default(true)
  enableReminder2h  Boolean  @default(true)
  enableVaccineAlert Boolean  @default(true)
  enableFollowUp    Boolean  @default(true)
  enableRetention   Boolean  @default(true)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model NotificationTemplate {
  id          String   @id @default(uuid())
  clinicId    String
  clinic      Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  event       String   // Enum do evento (APPT_CREATED, APPT_24H, APPT_2H, VACCINE_EXP, FOLLOW_UP, INACTIVE_CLIENT)
  channel     String   // EMAIL ou WHATSAPP
  subject     String?  // Obrigatório para Email
  body        String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([clinicId, event, channel])
}

model NotificationLog {
  id             String   @id @default(uuid())
  clinicId       String
  clinic         Clinic   @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  channel        String   // EMAIL ou WHATSAPP
  to             String   // E-mail ou Telefone do destinatário
  subject        String?
  body           String   @db.Text
  status         String   // PENDING, SENT, FAILED
  errorMessage   String?  @db.Text
  event          String   // Nome do evento associado
  scheduledFor   DateTime? // Para delayed jobs
  sentAt         DateTime?
  
  // Relações opcionais para auditoria detalhada
  appointmentId  String?
  clientId       String?
  petId          String?
  
  createdAt      DateTime @default(now())
}
```

### 2. Estratégia de Agendamento (BullMQ delayed vs Cron)
- **Delayed Jobs no BullMQ:** 
  - Ao criar um `Appointment`, agendar os jobs com `delay` no BullMQ correspondente ao tempo exato de disparo (Ex: `dataConsulta - 24h` e `dataConsulta - 2h`).
  - O `jobId` no BullMQ deve conter uma estrutura previsível como `appt-24h:${appointmentId}` and `appt-2h:${appointmentId}`.
  - Ao alterar ou cancelar o `Appointment`, o sistema deve buscar ativamente estes IDs de job no BullMQ e removê-los (`queue.getJob(jobId)` e `job.remove()`), garantindo consistência sem precisar rodar Crons recorrentes pesados.
- **Cron Jobs Diários:**
  - Rodará uma vez por dia às 02:00 da manhã.
  - Varre o banco em lotes (Prisma bulk query):
    - **Vacinas:** Busca vacinas programadas para os próximos X dias.
    - **Retenção:** Busca clientes sem consultas nos últimos 90 dias que não possuam um log de retenção nos últimos 90 dias (evitando spam diário).
  - Cada item elegível gera um job de notificação simples imediato na fila do BullMQ, garantindo que o processamento pesado e o controle de taxa de envio de APIs externas sejam gerenciados de forma assíncrona.

### 3. Integração com Evolution API (WhatsApp)
- Criar um provedor NestJS `EvolutionApiProvider` que encapsula requisições HTTP (`@nestjs/axios` ou `fetch`) para as rotas da Evolution API.
- Endpoints chave:
  - `POST /message/sendText`: Envio básico de mensagens de texto.
  - `GET /instance/connectionState`: Validação e teste de conexão da instância do cliente.

### 4. Criptografia de Dados Sensíveis
- Implementar um serviço `EncryptionService` que utiliza o módulo `crypto` nativo do Node.js.
- Algoritmo obrigatório: `aes-256-gcm` ou `aes-256-cbc`.
- Chave de encriptação fornecida via variável de ambiente: `ENCRYPTION_KEY` (deve ser de 32 bytes).

### 5. Observabilidade no Frontend
- O painel de histórico deve permitir busca por cliente/pet e filtros por status e canal.
- Ações interativas integradas para reenvio manual e disparo de testes avulsos, provendo uma experiência premium aos administradores das clínicas.
