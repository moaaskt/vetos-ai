# Database Architecture & Migrations

O VetOS AI utiliza um banco de dados relacional **PostgreSQL**, mapeado e gerenciado através do **Prisma ORM**.

## 1. Estrutura de Tabelas e Entidades

O banco é composto por 25 entidades, categorizadas por escopo:

### Entidades do Tenant (Multi-tenant)
Representam dados pertencentes a clínicas específicas e possuem a coluna `clinicId`:
* `ClinicSubscription`, `User`, `Client` (Tutor), `Pet` (Paciente), `Appointment` (Consulta), `WeightRecord` (Peso), `Allergy`, `VaccineRecord`, `VaccineProtocol`, `ClinicalRecord` (Evolução), `NotificationConfig`, `NotificationTemplate`, `NotificationLog`, `ClinicalAttachment`, `Prescription`, `ConsentTemplate`, `ConsentTerm`.

### Entidades Globais (Sem `clinicId`)
Modelos transversais à aplicação ou de suporte estrutural:
* `Clinic` (Entidade raiz do tenant).
* `Plan` (Planos de assinatura SaaS).
* `ImpersonationLog` (Auditoria de super admin).
* `TutorIdentity` (Identidade global unificada cross-tenant para o portal do tutor).
* `TutorPortalToken` e `TutorSession` (Gestão de acessos do tutor).
* `VaccineProtocolDose` (Normalização interna de doses vacinais).

## 2. Políticas de Integridade e Relacionamentos

* **Deleções em Cascata (`onDelete: Cascade`)**: Se um `Pet` ou uma `Clinic` for deletada, todo o histórico clínico correspondente (`WeightRecord`, `Allergy`, `VaccineRecord`, `ClinicalRecord`, `ClinicalAttachment`, `Prescription`, `ConsentTerm`) é excluído automaticamente para fins de LGPD e manutenção do banco.
* **Definir como Nulo (`onDelete: SetNull`)**: Usado em chaves estrangeiras opcionais, como `uploadedById` em anexos e `protocolId` / `protocolDoseId` em registros de vacinas se os protocolos originais forem removidos.

## 3. Histórico de Migrations

Originalmente iniciado com a migration `20260626194014_init`.
* **Prática Recomendada**:
  * **NUNCA** utilize `prisma db push` em homologação ou produção.
  * **Deploy**: Sempre use `npx prisma migrate deploy` nos servidores de produção e homologação.
  * **Desenvolvimento**: Utilize `npx prisma migrate dev --name <nome_da_alteracao>` localmente ao alterar o `schema.prisma`.
