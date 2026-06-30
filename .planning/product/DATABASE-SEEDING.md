    # Estratégia de Seeding do Banco de Dados — VetOS AI

Este documento estabelece as diretrizes para a criação do banco de dados de desenvolvimento e homologação do **VetOS AI**. Como o ambiente local foi reiniciado, torna-se crítico dispor de um fluxo automatizado de carga de dados fictícios de teste.

---

## 1. Diretrizes Gerais para Seeds

1. **Respeito Estrito ao Multi-Tenant:**
   - Todos os dados semeados devem possuir chaves estrangeiras válidas e pertencer especificamente a clínicas distintas (ex.: `Clinic A` e `Clinic B`). Nenhum dado clínico de uma clínica demo deve ser associado ou visível a outra.
2. **Uso de Dados Fictícios (Sem Dados Reais):**
   - Não utilizar nomes, CPFs, e-mails ou números de telefones reais de clientes ou profissionais de saúde em nenhuma hipótese.
3. **Integridade de Negócio:**
   - Os registros devem fazer sentido clínico e temporal. Exemplo: um pet com vacina agendada no futuro deve possuir registros de consultas passadas, e um termo de consentimento assinado pelo tutor deve ter data de aceite coerente com a data da internação.

---

## 2. Estrutura Mínima dos Dados de Seed

O script de seed deverá popular as seguintes entidades nas quantidades recomendadas para simulação de produção:

### 2.1 Estrutura Organizacional e Acesso
*   **Clinics (Clínicas Demo):**
    *   `Clinic Alfa` (Plano Professional)
    *   `Clinic Beta` (Plano Starter)
*   **Plans & Subscriptions (Planos e Assinaturas):**
    *   Planos: `Starter`, `Professional`, `Enterprise`.
    *   Duas assinaturas ativas vinculadas às clínicas demo.
*   **Users (Profissionais/Staff):**
    *   `Clinic Alfa`: 1 Usuário Admin (veterinário) e 1 Usuário Staff (recepcionista).
    *   `Clinic Beta`: 1 Usuário Admin.
    *   1 Super-Admin global (para testes no painel de administração global).

### 2.2 Dados de Clientes e Pacientes
*   **Clients (Tutores):**
    *   Pelo menos 4 tutores demo, com dados completos (CPF fictício, telefone no formato brasileiro e endereço completo).
*   **Pets (Animais):**
    *   Pelo menos 6 pets vinculados aos tutores demo, contendo espécies variadas (cães, gatos), raças comuns, idades e pesos variados.
*   **Allergies & Weight Records (Alergias e Histórico de Peso):**
    *   Alergias ativas mapeadas (ex.: alergia a dipirona ou ração X).
    *   Histórico com 3 a 5 pesagens por pet ao longo dos últimos meses.

### 2.3 Atendimento Clínico e Documentos
*   **Appointments (Consultas/Agendamentos):**
    *   Agendamentos passados (concluídos), agendamentos para o dia de hoje (em andamento) e agendamentos futuros (planejados).
*   **Clinical Records (Histórico Médico):**
    *   Registros clínicos vinculados aos agendamentos contendo notas de evolução do paciente.
*   **Clinical Attachments (Anexos de Exames):**
    *   Registros de anexos associados com caminhos de arquivos mockados.
*   **Prescriptions (Receitas):**
    *   Receitas medicamentosas emitidas e assinadas digitalmente pelo veterinário demo.
*   **Consent Terms & Templates (Termos de Consentimento):**
    *   Modelos de termos base (Termo de Internação, Termo de Eutanásia).
    *   Pelo menos 2 termos de consentimento gerados para os pets, um assinado pelo tutor (`PublicDocumentView` simulado) e outro pendente.

### 2.4 Notificações e Configuração
*   **Notification Configs & Templates:**
    *   Templates padrão de mensagens cadastrados para E-mail e WhatsApp (Confirmação de Consulta, Lembrete de Vacina).
    *   Configurações de disparo ativas para as clínicas.
*   **Notification Logs:**
    *   Histórico de disparos simulando mensagens enviadas com sucesso e algumas falhas simuladas de envio.

---

## 3. Implementação Recomendada (Futuro script `seed.ts`)

A implementação física do seed deverá ser realizada no arquivo `backend/prisma/seed.ts` utilizando a biblioteca Prisma Client. 

### Exemplo Conceitual da Lógica do Seed
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Limpeza de dados respeitando restrições de integridade
  await prisma.impersonationLog.deleteMany({});
  await prisma.clinicalRecord.deleteMany({});
  // ... deletar demais tabelas auxiliares
  await prisma.clinic.deleteMany({});
  await prisma.plan.deleteMany({});

  // 2. Criação de Planos de Exemplo
  const planProfessional = await prisma.plan.create({
    data: {
      name: 'Professional',
      maxStaffSeats: 10,
      maxNotifications: 1000,
      maxStorage: 10240, // 10GB
      features: JSON.stringify(['whatsapp', 'analytics', 'signatures']),
    }
  });

  // 3. Criação de Clínicas isoladas
  const clinicAlfa = await prisma.clinic.create({
    data: { name: 'Clínica Veterinária Alfa' }
  });

  // 4. Criação de Assinaturas e Usuários com clinicId vinculado
  // ... criar dados com segurança sem compartilhar clinicId de forma cruzada
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
```

Para rodar o seed futuramente:
```bash
npx prisma db seed
```
*(Importante: Não execute este comando até que a estrutura do script esteja plenamente revisada e implementada de acordo com as necessidades da Fase 15).*
