# VetOS AI - Multi-tenancy Security Audit

Este documento descreve a auditoria de segurança de multi-tenancy realizada na **Sprint 1.2.5** para mapear vulnerabilidades de vazamento e manipulação de dados entre clínicas (tenants) e definir a arquitetura de proteção ideal.

---

## 1. Tabela de Operações e Vulnerabilidades

Foram auditadas todas as operações do Prisma Client nos principais serviços do backend. Classificações utilizadas:
* 🟢 **Seguro**: Operação filtra ou valida explicitamente o `clinicId` do tenant autenticado.
* 🟡 **Parcialmente seguro**: O serviço valida o pertencimento em uma etapa de leitura anterior, mas executa a query final de escrita/deleção confiando apenas na chave primária `id`.
* 🔴 **Inseguro**: O serviço realiza escrita, leitura ou deleção diretamente pelo `id` sem garantir o escopo do tenant, abrindo margem para manipulação cross-tenant.

| Arquivo (Service) | Método | Operação Prisma | Status | clinicId presente? | Criticidade | Observações |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| `clients.service.ts` | `update` | `client.update` | 🔴 Inseguro | Não | **Alta** | Permite que qualquer clínica altere os dados de tutores de outras clínicas se souber o UUID. |
| `prescriptions.service.ts` | `update` | `prescription.update` | 🔴 Inseguro | Não | **Alta** | Atualiza a receita médica usando apenas `{ id }` na cláusula `where`. |
| `prescriptions.service.ts` | `remove` | `prescription.delete` | 🔴 Inseguro | Não | **Alta** | Deleta a receita médica usando apenas `{ id }` na cláusula `where`. |
| `consent-terms.service.ts` | `update` | `consentTerm.update` | 🔴 Inseguro | Não | **Alta** | Atualiza o termo usando apenas `{ id }` na cláusula `where`. |
| `consent-terms.service.ts` | `remove` | `consentTerm.delete` | 🔴 Inseguro | Não | **Alta** | Deleta o termo usando apenas `{ id }` na cláusula `where`. |
| `vaccines.service.ts` | `updateProtocol` | `vaccineProtocol.update` | 🔴 Inseguro | Não | **Média** | Atualiza o protocolo vacinal usando apenas `{ id }`. |
| `vaccines.service.ts` | `removeProtocol` | `vaccineProtocol.delete` | 🔴 Inseguro | Não | **Média** | Deleta o protocolo vacinal usando apenas `{ id }`. |
| `vaccines.service.ts` | `applyScheduledDose` | `vaccineRecord.update` | 🟡 Parcialmente | Não (na query) | **Média** | Valida o registro na leitura anterior, mas o update é feito apenas por `{ id }`. |
| `clinical-attachments.service.ts` | `remove` | `clinicalAttachment.delete` | 🟡 Parcialmente | Não (na query) | **Média** | Valida o anexo na leitura anterior, mas deleta do banco apenas por `{ id }`. |
| `allergies.service.ts` | `remove` | `allergy.deleteMany` | 🟢 Seguro | Sim | Baixa | Filtra por `{ id, clinicId }` na deleção direta. |
| `appointments.service.ts` | `update` | `appointment.updateMany` | 🟢 Seguro | Sim | Baixa | Utiliza `updateMany` forçando `{ id, clinicId }`. |
| `appointments.service.ts` | `remove` | `appointment.deleteMany` | 🟢 Seguro | Sim | Baixa | Utiliza `deleteMany` forçando `{ id, clinicId }`. |
| `pets.service.ts` | `update` | `pet.updateMany` | 🟢 Seguro | Sim | Baixa | Utiliza `updateMany` com `{ id, clinicId }`. |
| `pets.service.ts` | `remove` | `pet.deleteMany` | 🟢 Seguro | Sim | Baixa | Utiliza `deleteMany` com `{ id, clinicId }`. |
| `weight-records.service.ts` | `remove` | `weightRecord.deleteMany` | 🟢 Seguro | Sim | Baixa | Filtra por `{ id, clinicId }` na deleção. |

---

## 2. Comparativo de Estratégias de Proteção

Análise técnica das alternativas para blindagem do isolamento lógico de tenants:

### OPÇÃO A: Adicionar clinicId manualmente em todos os Services
* **Vantagens**: Simplicidade conceitual. Sem "mágica" no framework.
* **Desvantagens**: Altíssimo risco de erro humano. Qualquer novo desenvolvedor que crie um endpoint ou método pode esquecer de incluir a cláusula `clinicId`, reinserindo vulnerabilidades no sistema.
* **Performance**: Excelente.
* **Manutenção / Complexidade / Risco / Escalabilidade**: Baixa manutenibilidade, alta complexidade a longo prazo, alto risco e baixa escalabilidade.

### OPÇÃO B: Criar um TenantPrismaService
* **Vantagens**: Centralização parcial. Evita importar o PrismaService padrão diretamente nos serviços.
* **Desvantagens**: Quebra a compatibilidade de digitação do Prisma Client gerado, forçando o desenvolvimento de wrappers complexos para cada operação.
* **Performance**: Boa.
* **Manutenção / Complexidade / Risco / Escalabilidade**: Manutenção complexa, alta complexidade de código, médio risco, média escalabilidade.

### OPÇÃO C: Utilizar Prisma Client Extensions
* **Vantagens**: Solução recomendada e nativa do Prisma (v4.7.0+). Intercepta todas as consultas a nível de ORM (read, write, delete) e injeta o `clinicId` dinamicamente com base no contexto da requisição atual. O programador não consegue burlar ou esquecer a segurança.
* **Desvantagens**: Requer integração com `AsyncLocalStorage` do NestJS para obter o `clinicId` do usuário logado na thread da requisição. Exige atenção especial para queries globais (SuperAdmin) ou públicas (Magic Link, verificação de hashes).
* **Performance**: Excelente (mínimo overhead de JS).
* **Manutenção / Complexidade / Risco / Escalabilidade**: Altíssima manutenibilidade, média complexidade inicial de infraestrutura, baixíssimo risco operacional e excelente escalabilidade.

### Arquitetura Recomendada: **OPÇÃO C (Prisma Client Extensions)**
**Justificativa**: A arquitetura de um SaaS médico exige tolerância zero a vazamento de dados de pacientes. Delegar a responsabilidade da segurança ao desenvolvedor (Opção A) é um risco inaceitável. A extensão do Prisma Client garante blindagem a nível de infraestrutura.

---

## 3. Plano de Migração (Para a Sprint 1.3)

### Estimativa de Esforço
* **Arquivos afetados**: ~15 arquivos de serviços e infraestrutura.
* **Services**: ~10 Services clínicos principais.
* **Operações Prisma Auditadas**: 48 operações.
* **Vulnerabilidades Críticas**: 9 operações vulneráveis a manipulação cross-tenant.

### Passos de Execução
1. Criar um middleware global no NestJS que extraia o `clinicId` do token JWT do usuário logado.
2. Injetar o `clinicId` em um contexto isolado usando `AsyncLocalStorage` do Node.js.
3. Criar uma extensão customizada do Prisma Client (`prisma.extension.ts`) que intercepte operações do tipo `query` das tabelas que possuem a coluna `clinicId`, adicionando o filtro `{ clinicId }` no argumento `where`.
4. Substituir a injeção do `PrismaService` tradicional nos serviços pelo cliente estendido.
5. Rodar testes automatizados de integração simulando tentativas de acesso de uma clínica a chaves de outra clínica.
