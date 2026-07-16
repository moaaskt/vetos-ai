# VetOS AI - Database Architecture Audit

Este documento detalha a modelagem, os relacionamentos, as regras de integridade e a estratégia de multi-tenancy do banco de dados do VetOS AI, com base na análise do arquivo `schema.prisma`.

---

## 1. Inventário das Entidades

O banco de dados do VetOS AI é composto por **25 entidades**. Abaixo estão mapeadas as responsabilidades, principais campos e relacionamentos de cada uma:

### 1. Clinic (Clínica / Tenant)
* **Finalidade/Responsabilidade**: Entidade central da arquitetura multi-tenant. Representa o cliente corporativo (clínica veterinária) que utiliza o software.
* **Principais campos**: `id` (UUID), `name` (String), `address` (String?), `phone` (String?).
* **Relacionamentos**: Possui relacionamento 1:N com quase todos os dados operacionais (Users, Clients, Pets, Appointments, etc.) e 1:1 com `ClinicSubscription` e `NotificationConfig`.
* **Dependências**: Nenhuma (entidade raiz).

### 2. User (Usuário da Clínica)
* **Finalidade/Responsabilidade**: Representa os colaboradores internos da clínica (Veterinários, Staff administrativo) ou os Super Admins do sistema.
* **Principais campos**: `id` (UUID), `email` (String - Único), `password` (String - hash), `role` (Role - enum).
* **Relacionamentos**: Pertence a uma `Clinic` (1:N opcional, pois Super Admins não possuem clínica vinculada).
* **Dependências**: Depende de `Clinic` (opcional).

### 3. Client (Cliente / Tutor na clínica)
* **Finalidade/Responsabilidade**: Cadastro do tutor de pets específico de uma clínica.
* **Principais campos**: `id` (UUID), `name`, `cpf`, `phone`, `email`, `whatsapp`, dados de endereço estruturado.
* **Relacionamentos**: Pertence a uma `Clinic` (1:N) e possui um vínculo opcional de identidade global (`tutorIdentityId`). Possui 1:N com `Pet`.
* **Dependências**: Depende de `Clinic` (obrigatório) e `TutorIdentity` (opcional).
* **Restrição única**: Combinação única de `[clinicId, cpf]` para impedir CPFs duplicados no mesmo tenant.

### 4. Pet (Paciente / Paciente Animal)
* **Finalidade/Responsabilidade**: Cadastro dos pacientes animais atendidos na clínica.
* **Principais campos**: `id`, `name`, `species` (DOG/CAT/OTHER), `breed`, `age`.
* **Relacionamentos**: Pertence a uma `Clinic` (1:N) e a um `Client` (1:N). Possui relações 1:N com prontuários, registros de peso, alergias, vacinas, receitas e termos.
* **Dependências**: Depende de `Clinic` e `Client`.

### 5. Appointment (Consulta / Agendamento)
* **Finalidade/Responsabilidade**: Controle de datas e status das consultas dos pacientes.
* **Principais campos**: `id`, `date` (DateTime), `reason`, `status` (SCHEDULED/COMPLETED/CANCELLED).
* **Relacionamentos**: Vinculado a uma `Clinic` (1:N), `Client` (1:N) e `Pet` (1:N).
* **Dependências**: Depende de `Clinic`, `Client` e `Pet`.

### 6. ImpersonationLog (Log de Personificação)
* **Finalidade/Responsabilidade**: Auditoria de segurança que registra quando um Super Admin assume a identidade de uma clínica para suporte.
* **Principais campos**: `id`, `superAdminId`, `targetClinicId`, `reason`, `startedAt`.
* **Relacionamentos**: Vinculado ao `User` (Super Admin) e à `Clinic` (Alvo).
* **Dependências**: Depende de `User` e `Clinic`.

### 7. Plan (Plano de Assinatura)
* **Finalidade/Responsabilidade**: Configuração global dos planos do SaaS.
* **Principais campos**: `id`, `name` (Único), `maxStaffSeats`, `maxNotifications`, `maxStorage`, `features` (JSON).
* **Relacionamentos**: Relacionamento 1:N com `ClinicSubscription`.
* **Dependências**: Nenhuma (tabela global).

### 8. ClinicSubscription (Assinatura do Tenant)
* **Finalidade/Responsabilidade**: Vincula uma clínica a um plano e define limites operacionais customizados.
* **Principais campos**: `id`, `clinicId` (Único), `planId`, limites customizados.
* **Relacionamentos**: Relação 1:1 com `Clinic` e N:1 com `Plan`.
* **Dependências**: Depende de `Clinic` e `Plan`.

### 9. WeightRecord (Registro de Peso)
* **Finalidade/Responsabilidade**: Histórico de pesagem de um pet para acompanhamento de saúde.
* **Principais campos**: `id`, `weight` (Float), `date` (DateTime).
* **Relacionamentos**: Vinculado a um `Pet` (1:N) e a uma `Clinic` (1:N).
* **Dependências**: Depende de `Pet` e `Clinic`.

### 10. Allergy (Alergias do Paciente)
* **Finalidade/Responsabilidade**: Cadastro de alergias alimentares ou medicamentosas dos pets.
* **Principais campos**: `id`, `name` (String).
* **Relacionamentos**: Vinculado a um `Pet` (1:N) e a uma `Clinic` (1:N).
* **Dependências**: Depende de `Pet` e `Clinic`.

### 11. VaccineRecord (Registro de Vacina)
* **Finalidade/Responsabilidade**: Registro de aplicação ou agendamento de doses vacinais nos pets.
* **Principais campos**: `id`, `name`, `date` (DateTime), `nextDoseDate` (DateTime?), `status` (APPLIED/SCHEDULED).
* **Relacionamentos**: Vinculado a `Pet`, `Clinic`, `VaccineProtocol` (opcional), `VaccineProtocolDose` (opcional) e `User` (veterinário que aplicou).
* **Dependências**: Depende de `Pet` e `Clinic`.

### 12. VaccineProtocol (Protocolo Vacinal)
* **Finalidade/Responsabilidade**: Configurações de esquemas de vacinação por espécie criados pelas clínicas.
* **Principais campos**: `id`, `name`, `species`.
* **Relacionamentos**: Pertence a uma `Clinic` (1:N) e possui 1:N com `VaccineProtocolDose`.
* **Dependências**: Depende de `Clinic`.

### 13. VaccineProtocolDose (Doses do Protocolo)
* **Finalidade/Responsabilidade**: Detalha cada dose necessária em um protocolo vacinal (ex: V10 - 1ª dose, V10 - 2ª dose).
* **Principais campos**: `id`, `vaccineName`, `doseOrder` (Int), `intervalDays` (Int).
* **Relacionamentos**: Pertence a um `VaccineProtocol` (1:N) e possui 1:N com `VaccineRecord`.
* **Dependências**: Depende de `VaccineProtocol`.

### 14. ClinicalRecord (Evolução / Prontuário Clínico)
* **Finalidade/Responsabilidade**: Anotações médicas, exames físicos e evolução diária do paciente.
* **Principais campos**: `id`, `type` (NOTE/PROCEDURE), `title`, `content`, `date`.
* **Relacionamentos**: Vinculado a `Pet` e `Clinic`. Possui relação 1:N com anexos, receitas e termos.
* **Dependências**: Depende de `Pet` e `Clinic`.

### 15. NotificationConfig (Configuração de Mensageria)
* **Finalidade/Responsabilidade**: Armazena as credenciais de SMTP e WhatsApp de cada clínica.
* **Principais campos**: `id`, `clinicId` (Único), dados de SMTP e chaves da Evolution API (criptografados).
* **Relacionamentos**: Vinculado a uma `Clinic` (1:1).
* **Dependências**: Depende de `Clinic`.

### 16. NotificationTemplate (Templates de Mensagens)
* **Finalidade/Responsabilidade**: Modelos de e-mail/WhatsApp personalizados criados pelas clínicas.
* **Principais campos**: `id`, `event` (String), `channel` (EMAIL/WHATSAPP), `subject`, `body`.
* **Relacionamentos**: Vinculado a uma `Clinic` (1:N).
* **Dependências**: Depende de `Clinic`.
* **Restrição única**: Combinação única de `[clinicId, event, channel]` para evitar templates duplicados do mesmo tipo.

### 17. NotificationLog (Log de Disparos)
* **Finalidade/Responsabilidade**: Rastreamento histórico de todas as mensagens de notificação enviadas aos tutores.
* **Principais campos**: `id`, `channel`, `to`, `subject`, `body`, `status` (PENDING/SENT/FAILED), `errorMessage`, `event`.
* **Relacionamentos**: Vinculado a `Clinic`, `Appointment`, `Client`, `Pet`, `VaccineRecord`, `Prescription` e `ConsentTerm`.
* **Dependências**: Depende de `Clinic` (obrigatória).

### 18. ClinicalAttachment (Anexos Clínicos)
* **Finalidade/Responsabilidade**: Metadados de arquivos (PDFs, exames laboratoriais, radiografias) anexados aos prontuários dos pacientes.
* **Principais campos**: `id`, `originalFileName`, `storedFileName`, `mimeType`, `fileSize` (BigInt), `storagePath`, `visibleToTutor`.
* **Relacionamentos**: Vinculado a `Clinic`, `Pet`, `ClinicalRecord` (opcional), `User` (upload feito por).
* **Dependências**: Depende de `Clinic` e `Pet`.

### 19. Prescription (Receita Médica)
* **Finalidade/Responsabilidade**: Geração de receitas digitais para administração de remédios.
* **Principais campos**: `id`, `medicamento`, `dosagem`, `frequencia`, `status` (DRAFT/SIGNED), `documentHash` (SHA-256), `signedAt`, `verificationUrl`, `verificationQrCode`.
* **Relacionamentos**: Vinculado a `Pet`, `Clinic`, `ClinicalRecord` (opcional) e `Appointment` (opcional).
* **Dependências**: Depende de `Pet` e `Clinic`.

### 20. ConsentTemplate (Template de Termos)
* **Finalidade/Responsabilidade**: Modelos base de termos de consentimento (castração, cirurgia, internação).
* **Principais campos**: `id`, `name`, `procedureType`, `baseText`.
* **Relacionamentos**: Vinculado a uma `Clinic` (1:N) e possui 1:N com `ConsentTerm`.
* **Dependências**: Depende de `Clinic`.

### 21. ConsentTerm (Termo de Consentimento Clínico)
* **Finalidade/Responsabilidade**: Termo oficial com dados interpolados do pet/tutor que necessita de assinatura.
* **Principais campos**: `id`, `finalText`, `status`, `documentHash`, `tutorSigned` (Boolean), dados de assinatura eletrônica do tutor (nome, CPF, IP, UserAgent).
* **Relacionamentos**: Vinculado a `Pet`, `Clinic`, `Appointment` (opcional) e `ConsentTemplate` (opcional).
* **Dependências**: Depende de `Pet` e `Clinic`.

### 22. TutorIdentity (Identidade Global do Tutor)
* **Finalidade/Responsabilidade**: Entidade central global (Cross-Tenant) para unificar o tutor do pet em toda a base da aplicação (SaaS), permitindo que um tutor visualize pets cadastrados em diferentes clínicas usando uma única credencial.
* **Principais campos**: `id` (UUID), `publicId` (String - Único), `primaryEmail` (Único), `primaryWhatsapp` (Único), `cpf` (Único), `preferredChannel`.
* **Relacionamentos**: Vinculado a múltiplos `Client` (1:N), `TutorPortalToken` (1:N) e `TutorSession` (1:N).
* **Dependências**: Nenhuma (global).

### 23. TutorPortalToken (Token do Magic Link)
* **Finalidade/Responsabilidade**: Chaves temporárias de uso único enviadas por e-mail para validar o acesso do tutor (Magic Link).
* **Principais campos**: `id`, `tokenHash` (Único), `expiresAt`, `usedAt`.
* **Relacionamentos**: Vinculado a `TutorIdentity` (N:1).
* **Dependências**: Depende de `TutorIdentity`.

### 24. TutorSession (Sessões do Tutor)
* **Finalidade/Responsabilidade**: Controle de sessões ativas do portal do tutor usando Refresh Tokens.
* **Principais campos**: `id`, `refreshTokenHash` (Único), `expiresAt`, `lastUsedAt`, `revokedAt`.
* **Relacionamentos**: Vinculado a `TutorIdentity` (N:1).
* **Dependências**: Depende de `TutorIdentity`.

---

## 2. Relacionamentos e Políticas Referenciais

O domínio foi modelado utilizando as seguintes restrições de integridade referencial do PostgreSQL (via Prisma):

### Relações 1:1
* **`Clinic` ↔ `ClinicSubscription`**: Cada clínica possui no máximo uma assinatura ativa de plano. A exclusão da clínica não está explicitamente sob Cascade, mas a integridade é mantida no nível de aplicação.
* **`Clinic` ↔ `NotificationConfig`**: Cada clínica possui apenas uma configuração de SMTP/WhatsApp. Cascateia exclusões (`onDelete: Cascade`), o que remove a configuração automaticamente caso a clínica seja deletada.

### Relações 1:N Principais
* **`Clinic` ↔ `Client` / `Pet` / `Appointment`**: Uma clínica possui muitos clientes, pacientes e agendamentos. A exclusão de um registro desses mantem políticas normais de chave estrangeira.
* **`Client` ↔ `Pet`**: Um cliente (tutor) possui múltiplos pets.
* **`Pet` ↔ Registros Clínicos (`WeightRecord`, `Allergy`, `VaccineRecord`, `ClinicalRecord`, `ClinicalAttachment`, `Prescription`, `ConsentTerm`)**: Todos utilizam **`onDelete: Cascade`**. Se um pet for excluído, todo o seu histórico clínico é deletado automaticamente para fins de LGPD e limpeza física do banco.
* **`Clinic` ↔ Registros Clínicos**: Também utilizam **`onDelete: Cascade`** na maioria das tabelas, garantindo que a remoção de um tenant (Clínica) limpe todos os dados de saúde associados.

### Políticas de Integridade
* **Cascade (Deleção em Cascata)**: Amplamente utilizada na relação do `Pet` e da `Clinic` com seus dados clínicos dependentes.
* **SetNull (Definir como Nulo)**: Utilizado em campos opcionais quando a entidade pai é removida.
  * *Exemplo*: Um `ClinicalAttachment` define `uploadedById` como `SetNull` se o `User` que fez o upload for removido da clínica.
  * *Exemplo*: Um `VaccineRecord` define `protocolId` e `protocolDoseId` como `SetNull` se o protocolo de vacina da clínica for apagado, preservando o histórico de aplicação no pet.
  * *Exemplo*: `Client` define `tutorIdentityId` como `SetNull` se a identidade global do tutor for apagada.
* **Restrict (Padrão Prisma)**: Utilizado implicitamente em relações estruturais como `User` ↔ `Clinic` ou `Appointment` ↔ `Pet` para impedir a remoção acidental caso existam pendências.

---

## 3. Análise da Estratégia de Multi-tenancy

O VetOS AI utiliza **Isolamento Lógico (Single Database, Shared Schema)**.

### Entidades Multi-tenant (Possuem `clinicId`)
* `User` (opcional, nulo para SUPERADMIN)
* `Client`
* `Pet`
* `Appointment`
* `ImpersonationLog` (chamado `targetClinicId`)
* `ClinicSubscription`
* `WeightRecord`
* `Allergy`
* `VaccineRecord`
* `VaccineProtocol`
* `ClinicalRecord`
* `NotificationConfig`
* `NotificationTemplate`
* `NotificationLog`
* `ClinicalAttachment`
* `Prescription`
* `ConsentTemplate`
* `ConsentTerm`

### Entidades Globais / Sem `clinicId`
* **`Plan`**: Catálogo de planos corporativos do SaaS.
* **`TutorIdentity`**: Identidade global do tutor (cross-tenant). Não deve possuir `clinicId` pois serve de ponte de acesso consolidada do tutor a múltiplos pets cadastrados em diferentes clínicas da plataforma.
* **`TutorPortalToken` / `TutorSession`**: Gerenciamento de credenciais de acesso temporário e sessões de tutores.
* **`VaccineProtocolDose`**: Tabela normalizada de doses. Ela aponta para `VaccineProtocol`, que por sua vez aponta para `clinicId`.

### Riscos de Vazamento de Dados Identificados
Como visto na auditoria arquitetural, o código do backend realiza isolamento lógico em tempo de query (`where: { clinicId }`). 
* **Ponto Fraco**: A tabela `Client` e outras tabelas clínicas são atualizadas nos Services usando apenas o `id` (chave primária da linha) no `where` do Prisma. Exemplo:
  ```typescript
  // Em clients.service.ts
  await this.prisma.client.update({ where: { id }, data: normalizedData });
  ```
  Se um usuário mal-intencionado de uma Clínica A enviar o `id` (UUID) pertencente a um cliente de uma Clínica B, a alteração de dados ocorrerá cruzando os limites de tenant (Cross-Tenant Modification).

---

## 4. Auditoria de Índices e Unicidade

### Índices de Unicidade (`@unique` e `@@unique`)
* `User.email`: Impede e-mails duplicados globais para login de funcionários.
* `Client.@@unique([clinicId, cpf])`: Garante que um CPF não seja duplicado na mesma clínica. No entanto, o mesmo CPF pode existir em clínicas diferentes, o que é correto.
* `ClinicSubscription.clinicId`: Garante que uma clínica tenha no máximo uma assinatura.
* `NotificationConfig.clinicId`: Garante que uma clínica tenha no máximo uma configuração de mensagens.
* `NotificationTemplate.@@unique([clinicId, event, channel])`: Impede conflito de templates de notificação repetidos para o mesmo evento.
* `Prescription.documentHash` e `ConsentTerm.documentHash`: Garante integridade absoluta dos documentos assinados digitalmente.
* `TutorIdentity` (`primaryEmail`, `primaryWhatsapp`, `cpf`, `publicId`): Garante unicidade dos dados do portal do tutor.

### Índices de Consulta (`@index` e `@@index`)
Prontuários e relacionamentos principais possuem índices explicitados no schema para otimização de queries de busca:
* `Client` possui índice em `tutorIdentityId`.
* `VaccineRecord` possui índices em `petId`, `clinicId`, `protocolId`, `protocolDoseId` e `appliedById`.
* `VaccineProtocol` possui índice em `clinicId`.
* `ClinicalAttachment` possui índices em `clinicId`, `petId`, `clinicalRecordId` e `uploadedById`.
* `Prescription` possui índices em `petId`, `clinicId`, `clinicalRecordId` e `appointmentId`.
* `ConsentTemplate` e `ConsentTerm` possuem índices em relacionamentos com clínica, pet e templates.

### Oportunidade de Índices Ausentes
* **`Appointment.date`**: Não há índice para o campo de data de agendamentos. Como a agenda do consultório é renderizada frequentemente por intervalos de datas e buscas diárias, a falta de índice na coluna `date` causará lentidão na renderização da agenda conforme o volume de agendamentos crescer.
* **`NotificationLog.createdAt`**: Não há índice na data de criação dos logs. As telas de histórico de mensageria sofrem buscas pesadas ordenadas por data.

---

## 5. Análise de Integridade e Riscos

* **Ciclos de Relacionamento**: Não foram encontrados loops perigosos de deleção. A hierarquia de deleção de dependências aponta de forma limpa para `Pet` e `Clinic`.
* **Campos Opcionais / Nullable Excessivos**:
  * Em `Client`, os campos de contato alternativos, dados jurídicos (`rg`) e endereço estruturado são todos opcionais. Isso faz sentido para simplificar o cadastro inicial no balcão da clínica.
  * O campo `clinicId` em `User` ser nulo para Super Admins é uma escolha comum de arquitetura, mas exige atenção extra no código para evitar erros de ponteiro nulo (`Cannot read property 'clinicId' of undefined`).

---

## 6. Diagrama Textual de Relacionamentos

```text
[Plan]
  └── (1:N) ── [ClinicSubscription] ── (1:1) ── [Clinic]
                                                  ├── (1:1) ── [NotificationConfig]
                                                  ├── (1:N) ── [NotificationTemplate]
                                                  ├── (1:N) ── [NotificationLog]
                                                  ├── (1:N) ── [ImpersonationLog]
                                                  ├── (1:N) ── [User] (Funcionários)
                                                  │              └── (1:N) ── [VaccineRecord] (Veterinário aplicou)
                                                  ├── (1:N) ── [VaccineProtocol]
                                                  │              └── (1:N) ── [VaccineProtocolDose]
                                                  │                             └── (1:N) ── [VaccineRecord]
                                                  ├── (1:N) ── [ConsentTemplate]
                                                  │              └── (1:N) ── [ConsentTerm]
                                                  │                             └── (1:N) ── [NotificationLog]
                                                  ├── (1:N) ── [Client] (Tutor local)
                                                  │              ├── (1:N) ── [Pet] (Paciente)
                                                  │              │              ├── (1:N) ── [Appointment]
                                                  │              │              ├── (1:N) ── [WeightRecord]
                                                  │              │              ├── (1:N) ── [Allergy]
                                                  │              │              ├── (1:N) ── [ClinicalRecord]
                                                  │              │              │              ├── (1:N) ── [ClinicalAttachment]
                                                  │              │              │              └── (1:N) ── [Prescription]
                                                  │              │              └── (1:N) ── [ConsentTerm]
                                                  │              └── (N:1, opcional)
                                                  │                    └── [TutorIdentity] (Identidade Global Cross-Tenant)
                                                  │                          ├── (1:N) ── [TutorPortalToken] (Magic Links)
                                                  │                          └── (1:N) ── [TutorSession] (Sessões)
```
