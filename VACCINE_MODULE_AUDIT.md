# Auditoria Completa do Módulo de Vacinação — VetOS AI

Esta auditoria analisa a modelagem de dados, fluxos de execução e lacunas técnicas do módulo de vacinação do **VetOS AI**, propondo o escopo e roadmap da **Fase 14B** para elevá-lo a um padrão de excelência de mercado.

---

## 1. Modelo de Dados de Vacinas Atual

Atualmente, o modelo é centrado na tabela `VaccineRecord` definida no [schema.prisma](file:///home/moadev/projetos/vetOSAI/backend/prisma/schema.prisma):

```prisma
model VaccineRecord {
  id           String    @id @default(uuid())
  name         String
  date         DateTime
  nextDoseDate DateTime?
  petId        String
  clinicId     String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  pet              Pet               @relation(fields: [petId], references: [id], onDelete: Cascade)
  clinic           Clinic            @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  notificationLogs NotificationLog[]
}
```

> [!NOTE]
> O modelo atual é **minimalista**: armazena apenas o nome comercial/geral da vacina, a data de aplicação e a data prevista para a próxima dose.

---

## 2. Fluxos Existentes no Sistema

1. **Criação de Registro (`POST /vaccines`)**: Permite cadastrar uma aplicação associada a um `petId` informando nome, data de aplicação e próxima dose. O sistema valida se o pet pertence à clínica logada.
2. **Remoção de Registro (`DELETE /vaccines/:id`)**: Remove a aplicação validando o isolamento do tenant.
3. **Listagem Embutida**: As vacinas são exibidas dentro da página de prontuário do pet (`PetDetails.tsx`) carregando as relações a partir do `findFirst` de Pets.
4. **Agendador de Lembretes (Fase 14A)**: O scheduler diário localiza vacinas cujos `nextDoseDate` estão nas janelas UTC-safe de D0, D-1 e D-7 e enfileira disparos via BullMQ baseados em templates padrões configurados pela clínica.

---

## 3. O que Clínicas Veterinárias Esperam de um Módulo Completo

Clínicas veterinárias profissionais possuem requisitos de conformidade, estoque e controle clínico muito mais rígidos:

- **Rastreabilidade e Lote**: Registro obrigatório de fabricante (laboratório), número do lote (`lotNumber`) e data de validade do frasco. Essencial para identificar falhas vacinais ou reportar reações adversas aos órgãos reguladores.
- **Responsabilidade Técnica**: Identificação clara do veterinário aplicador (CRMV e assinatura).
- **Status da Vacina**: Distinção clara entre:
  - `APPLIED` (Aplicada na clínica).
  - `HISTORICAL` (Registros antigos que o tutor trouxe de outra clínica).
  - `SCHEDULED` (Vacinas futuras planejadas/agendadas que precisam ser aplicadas).
- **Protocolos Automatizados**: Geração em lote de agendamentos de vacina de filhote (e.g. 1ª, 2ª e 3ª dose de V10 a cada 21/28 dias, seguidas de raiva) baseando-se na data de nascimento do pet.
- **Certificado de Vacinação (PDF)**: Exportação de documento impresso ou digital elegante atestando as vacinas em dia do animal para viagens, banho e tosa ou hospedagem.
- **Painel Global de Reengajamento**: Listagem centralizada de todas as vacinas atrasadas da clínica para que a recepção/veterinário possa entrar em contato direto ou gerenciar os envios automáticos.

---

## 4. Entidades Ausentes no Banco de Dados (Missing Entities)

Para suportar fluxos profissionais, o banco necessitaria dos seguintes modelos adicionais:

### `VaccineBatch` (Lote de Vacina / Estoque)
- `id` (UUID), `lotNumber` (String), `expirationDate` (DateTime), `manufacturer` (String), `quantityInStock` (Int), `clinicId` (String).

### `VaccineProtocol` (Protocolo Vacinal)
- `id` (UUID), `name` (String - ex: "Protocolo Canino V10+Raiva"), `species` (Enum: DOG, CAT), `clinicId` (String).

### `VaccineProtocolDose` (Etapa do Protocolo)
- `id` (UUID), `protocolId` (FK), `vaccineName` (String), `doseOrder` (Int - ex: 1, 2, 3), `intervalDays` (Int - dias a esperar da dose anterior).

### Adições necessárias ao model `VaccineRecord`:
- `lotNumber String?`
- `manufacturer String?`
- `status VaccineStatus` (Enum: `APPLIED`, `HISTORICAL`, `SCHEDULED` - default `APPLIED`)
- `appliedById String?` (Veterinário aplicador - relação opcional com `User`)
- `notes String?` (Observações clínicas da aplicação)

---

## 5. APIs do Backend Ausentes (Missing Backend APIs)

- `GET /vaccines`: Listagem geral e paginada de todas as vacinas com filtros por pet, status, data de vencimento e tutor.
- `GET /vaccines/upcoming`: Endpoint específico para alimentar a recepção com vacinas atrasadas e a vencer na clínica inteira.
- `PATCH /vaccines/:id`: Modificação de registros de vacina existentes (e.g. atualizar data da dose ou observações).
- `POST /vaccines/:id/apply`: Endpoint para converter uma vacina `SCHEDULED` em `APPLIED`, subtraindo a quantidade do `VaccineBatch` associado e registrando o CRMV do aplicador.
- `GET /vaccines/pdf/certificate?petId=...`: Geração dinâmica de PDF do certificado de vacinação oficial com marca d'água da clínica.

---

## 6. Telas e Elementos de UI do Frontend Ausentes

- **Dashboard de Imunização (`/vaccines`)**: Painel principal consolidando:
  - Lista global de vacinas próximas ao vencimento ou atrasadas.
  - Indicadores rápidos de conversão (remetentes enviados vs agendados confirmados).
  - Ações rápidas de contato (WhatsApp Web direto).
- **Gestão de Estoque e Lotes**: Tela de inventário para cadastrar novos lotes de vacinas recebidos, com monitoramento de validade e alertas visuais de lotes próximos do vencimento.
- **Configurador de Protocolos**: Painel administrativo para a clínica desenhar os seus protocolos vacinais de cães/gatos e aplicá-los com um clique no prontuário de um filhote.
- **Emissor de Certificado (PetDetails)**: Botão no prontuário do pet para gerar e baixar instantaneamente o cartão de vacinas/certificado oficial em PDF.

---

## 7. Proposta de Roadmap para a Fase 14B (UI de Vacinas & Reengajamento)

A Fase 14B deve ser estruturada em 3 Waves para entregar valor de forma incremental:

```mermaid
chronology
    title Cronograma Proposto para Fase 14B
    Wave 14B.1 - Centralização e Certificados : CRUD geral de vacinas, listagem com filtros no backend e botão de geração de PDF do certificado de vacinação.
    Wave 14B.2 - Gestão de Lotes e Protocolos : Cadastro de lotes, validação de validade/CRMV na aplicação, e automação de agendamentos por protocolo de filhote.
    Wave 14B.3 - Painel de Reengajamento na UI : Tela dedicada com lista de vacinas vencidas/atrasadas e acionamento de lembretes direto do frontend.
```

### Detalhamento das Waves:

- **Wave 14B.1 (1 semana)**:
  - Backend: Criação do endpoint `GET /vaccines` e de geração do PDF do certificado de vacinas em `/vaccines/pdf/certificate`.
  - Frontend: Inclusão do botão "Exportar Certificado" em `PetDetails.tsx` e melhoria do layout da aba de vacinas no prontuário.
- **Wave 14B.2 (1.5 semanas)**:
  - Modelagem: Adição dos campos `lotNumber`, `manufacturer`, `status` e `appliedById` no `VaccineRecord`.
  - Backend: Rotas de CRUD para `VaccineBatch` e aplicação inteligente de protocolos.
  - Frontend: Cadastro de lotes no painel de configurações.
- **Wave 14B.3 (1 semana)**:
  - Frontend: Nova página `/vaccines` consolidando a lista geral de lembretes ativos, contatos diretos por WhatsApp e logs de e-mails disparados pelo BullMQ.
