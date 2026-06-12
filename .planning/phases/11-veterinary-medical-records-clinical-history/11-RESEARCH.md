# Fase 11: Prontuário Veterinário e Histórico Clínico - Pesquisa Técnica

**Data de Criação:** 2026-05-19
**Autor:** Antigravity AI

Este documento detalha o levantamento técnico, a arquitetura do banco de dados, o design da API e a estrutura do frontend para a implementação do Módulo de Prontuários Veterinários e Histórico Clínico.

---

## 1. Arquitetura do Banco de Dados (Prisma)

A modelagem de dados foi expandida para suportar o rastreamento clínico completo, mantendo o isolamento multi-tenant por meio do atributo `clinicId` e integridade referencial com a tabela `Pet` por meio de `petId`.

### Novos Modelos no `schema.prisma`

```prisma
model WeightRecord {
  id         String   @id @default(uuid())
  weight     Float
  measuredAt DateTime @default(now())
  petId      String
  clinicId   String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  pet    Pet    @relation(fields: [petId], references: [id], onDelete: Cascade)
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
}

enum AllergySeverity {
  LOW
  MEDIUM
  HIGH
}

model Allergy {
  id        String          @id @default(uuid())
  name      String
  severity  AllergySeverity @default(MEDIUM)
  notes     String?
  petId     String
  clinicId  String
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  pet    Pet    @relation(fields: [petId], references: [id], onDelete: Cascade)
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
}

model VaccineRecord {
  id            String    @id @default(uuid())
  name          String
  appliedAt     DateTime  @default(now())
  nextDoseAt    DateTime?
  lot           String?
  veterinarian  String?
  petId         String
  clinicId      String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  pet    Pet    @relation(fields: [petId], references: [id], onDelete: Cascade)
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
}

enum ClinicalRecordType {
  NOTE
  PROCEDURE
  CONSULTATION
}

model ClinicalRecord {
  id          String             @id @default(uuid())
  type        ClinicalRecordType @default(NOTE)
  title       String
  description String
  performedAt DateTime           @default(now())
  petId       String
  clinicId    String
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  pet    Pet    @relation(fields: [petId], references: [id], onDelete: Cascade)
  clinic Clinic @relation(fields: [clinicId], references: [id], onDelete: Cascade)
}
```

*Nota:* A relação `onDelete: Cascade` foi explicitada para assegurar que a remoção de um paciente limpe automaticamente todos os registros clínicos associados, evitando registros órfãos e mantendo a integridade referencial.

---

## 2. API Backend & Controladores (NestJS)

Será criado o módulo `ClinicalRecordsModule` para expor os novos recursos através de controladores específicos. Para maior organização e seguindo os princípios de Responsabilidade Única (SRP), criaremos um controlador principal e serviços dedicados.

### Endpoints da API

Todas as rotas exigirão o cabeçalho de autenticação JWT e estarão protegidas por escopo de tenant. O `clinicId` será injetado pelo decorator `@CurrentUser()`.

#### A. Registros de Peso (Weight Records)
- **POST** `/pets/:petId/weights` - Adicionar novo peso.
  - Payload: `{ weight: number, measuredAt?: string }`
- **GET** `/pets/:petId/weights` - Obter histórico de peso (ordenado por `measuredAt` ascendente para o gráfico).
- **DELETE** `/pets/:petId/weights/:id` - Remover medição de peso.

#### B. Controle de Alergias (Allergies)
- **POST** `/pets/:petId/allergies` - Cadastrar nova alergia.
  - Payload: `{ name: string, severity: 'LOW' | 'MEDIUM' | 'HIGH', notes?: string }`
- **GET** `/pets/:petId/allergies` - Listar alergias do pet.
- **DELETE** `/pets/:petId/allergies/:id` - Remover alergia.

#### C. Controle de Vacinas (Vaccines)
- **POST** `/pets/:petId/vaccines` - Registrar vacina aplicada ou agendada.
  - Payload: `{ name: string, appliedAt: string, nextDoseAt?: string, lot?: string, veterinarian?: string }`
- **GET** `/pets/:petId/vaccines` - Listar vacinas do pet.
- **DELETE** `/pets/:petId/vaccines/:id` - Remover registro de vacina.

#### D. Histórico Clínico (Clinical Records)
- **POST** `/pets/:petId/records` - Adicionar nota ou procedimento.
  - Payload: `{ type: 'NOTE' | 'PROCEDURE' | 'CONSULTATION', title: string, description: string, performedAt?: string }`
- **GET** `/pets/:petId/records` - Obter a timeline clínica do pet (ordenada por `performedAt` descrescente).
- **DELETE** `/pets/:petId/records/:id` - Remover uma entrada clínica.

### Mecanismo de Proteção e Validação Multi-tenant

O serviço de prontuários validará se o `petId` fornecido pertence ao `clinicId` do usuário autenticado antes de criar ou modificar qualquer registro filho. Se o pet pertencer a outro tenant, uma exceção `ForbiddenException` ou `NotFoundException` será disparada imediatamente.

Exemplo de lógica de validação:
```typescript
async validatePetOwnership(clinicId: string, petId: string) {
  const pet = await this.prisma.pet.findFirst({
    where: { id: petId, clinicId }
  });
  if (!pet) {
    throw new NotFoundException('Paciente não encontrado ou não pertence a esta clínica.');
  }
}
```

---

## 3. Frontend & Arquitetura Visual (React + Tailwind)

### Estrutura de Rotas e Navegação

Será adicionada uma nova rota dinâmica no `App.tsx`:
- `/pets/:id` - Exibirá a página premium de detalhes do paciente: `PetDetails.tsx`.

No card de listagem em `Pets.tsx`, o clique no card redirecionará o usuário para `/pets/:id`.

### Estrutura de Componentes da Página de Detalhes (`PetDetails.tsx`)

Para manter o código limpo e de fácil manutenção, a página de prontuário premium será dividida em abas interativas organizadas em um grid premium e responsivo (Bento Grid):

1. **Aba Principal: Linha do Tempo Clínica (Timeline)**
   - Integra as consultas anteriores (buscadas da tabela `Appointment` via API do pet), procedimentos realizados e anotações dos veterinários em ordem cronológica reversa.
   - Apresenta ícones com cores diferenciadas por tipo de registro clínica.
2. **Aba de Saúde: Gráfico de Peso & Alergias**
   - Curva histórica de peso utilizando gráficos interativos (Chart.js / `react-chartjs-2`).
   - Cards premium com listagem de alergias divididas por severidade (LOW = Amarelo, MEDIUM = Laranja, HIGH = Vermelho).
3. **Aba de Imunizações: Vacinas**
   - Tabela premium com as vacinas tomadas, lote, veterinário aplicador e a data programada para a próxima dose.

### Integração de APIs no Frontend (`api.ts`)

Serão adicionadas novas funções ao cliente `api` em `frontend/src/lib/api.ts` para buscar e salvar os registros clínicos:
- `api.getPetDetails(id: string)`: Retorna o pet com dados do tutor (`client`) e as coleções relacionadas (`appointments`, `weightRecords`, `allergies`, `vaccineRecords`, `clinicalRecords`).

---

## 4. Estratégia de Teste e Validação

### Testes Unitários e Integração
- **Backend:** Criar testes para validar o escopo de tenant em cada operação do prontuário, garantindo que usuários de uma clínica não acessem prontuários de outra.
- **Frontend:** Validar se os componentes da timeline e de abas renderizam corretamente, tratam estados de carregamento (`Skeleton`) e erros de rede com elegância.

### Validação do Banco de Dados
- Executar `npx prisma db push` em ambiente de desenvolvimento local para criar as novas tabelas e chaves estrangeiras sem perda de dados desnecessária.
