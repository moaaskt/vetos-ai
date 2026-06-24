# Implementation Plan - Phase 16B.1.2: Cadastro Completo do Tutor

Este plano detalha as alterações necessárias no banco de dados, no backend e no frontend do VetOS AI para enriquecer as fichas cadastrais dos clientes/tutores de forma segura, mantendo a compatibilidade retroativa absoluta e preparando o terreno para integrações futuras.

---

## 1. Proposta de Alterações no Banco de Dados (Prisma Schema)

### [MODIFY] [schema.prisma](file:///home/moadev/projetos/vetOSAI/backend/prisma/schema.prisma)
Adicionar os campos opcionais no modelo `Client` e criar o índice composto multi-tenant de unicidade de CPF.

```diff
model Client {
  id               String            @id @default(uuid())
  name             String
  email            String?
  phone            String?
  clinicId         String
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  clinic           Clinic            @relation(fields: [clinicId], references: [id])
  pets             Pet[]
  appointments     Appointment[]
  notificationLogs NotificationLog[]
+
+  // Identificação e Dados Jurídicos (Opcionais)
+  cpf              String?
+  rg               String?
+  birthDate        DateTime?
+
+  // Contatos Expandidos
+  whatsapp         String?
+  emailAlt         String?
+  emergencyName    String?
+  emergencyPhone   String?
+
+  // Endereço Estruturado
+  postalCode       String?
+  street           String?
+  number           String?
+  complement       String?
+  neighborhood     String?
+  city             String?
+  state            String?
+
+  @@unique([clinicId, cpf])
}
```

*Nota:* No PostgreSQL, a cláusula `@@unique([clinicId, cpf])` é interpretada com `NULL` distinto, permitindo que vários registros de clientes sem CPF cadastrado coexistam no mesmo tenant (`clinicId`) sem violar a restrição.

---

## 2. Proposta de Alterações no Backend (NestJS)

### [MODIFY] [create-client.dto.ts](file:///home/moadev/projetos/vetOSAI/backend/src/clients/dto/create-client.dto.ts)
Atualizar o DTO usando decoradores de `class-validator` para validar sintaticamente cada campo quando fornecido (todos opcionais no DTO para preservar retrocompatibilidade).

*   `cpf`: Validação de string com máscara removida no pipeline. Usar `@IsOptional()`.
*   `postalCode` (CEP): Validação de tamanho 8.
*   `state` (UF): Validação de ISO UF com 2 caracteres.
*   `birthDate`: Converter string ISO para `Date`.
*   `email`, `emailAlt`: Validar tipo e-mail.

### [MODIFY] [clients.service.ts](file:///home/moadev/projetos/vetOSAI/backend/src/clients/clients.service.ts)
Incluir lógica de normalização e tratamento de nulos:
*   Se o `cpf` fornecido for uma string vazia `""`, contiver apenas espaços, ou for nulo/undefined, ele deve ser sanitizado e mapeado explicitamente para `null` antes de persistir no Prisma.
*   Remover pontuações e caracteres não numéricos de `cpf` (somente se houver valor real), `postalCode`, `phone` e `whatsapp` antes de salvar.
*   A validação do algoritmo de CPF (dígitos verificadores) e a validação de duplicidade por `ConflictException` (CPF já em uso na mesma clínica) devem ocorrer **apenas** quando o CPF for um valor real (não nulo).


---

## 3. Proposta de Alterações no Frontend (React)

### [MODIFY] [Clients.tsx](file:///home/moadev/projetos/vetOSAI/frontend/src/pages/Clients.tsx)
Expandir o modal de cadastro (`ClientModal`) e adicionar um modo de edição de tutor.
*   **Organização em Abas / Seções:**
    1.  *Dados Básicos:* Nome Completo, CPF (com máscara `000.000.000-00`), RG e Data de Nascimento.
    2.  *Contatos:* E-mail Principal, WhatsApp (máscara `(00) 00000-0000`), Telefone Fixo e E-mail Alternativo.
    3.  *Endereço:* CEP (máscara `00000-000`), Logradouro, Número, Complemento, Bairro, Cidade e Estado.
    4.  *Emergência:* Nome do Contato e Telefone.
*   **Busca Automática via ViaCEP:**
    *   Ao digitar 8 dígitos no campo de CEP, disparar uma requisição assíncrona segura para `https://viacep.com.br/ws/${cep}/json/`.
    *   Tratar falhas de rede de forma silenciosa para não travar a digitação manual se o serviço externo ViaCEP estiver indisponível.

---

## 4. Plano de Verificação

### Testes Automatizados
- Executar testes unitários e de integração existentes no backend:
  `npm --prefix backend run test`
- Validar esquema do Prisma:
  `npx prisma validate`
- Sincronizar o banco local de forma segura (sem perda de dados):
  `npx prisma db push`

### Manual Verification
- Acessar a tela de Diretório de Clientes.
- Abrir o modal, preencher um CEP válido e verificar se a busca automática do ViaCEP popula corretamente os campos de endereço.
- Tentar cadastrar dois tutores com o mesmo CPF na mesma clínica e validar se a trava de `ConflictException` funciona corretamente.
- Cadastrar um tutor com CPF em branco para validar que a restrição de unicidade permite múltiplos nulos.
