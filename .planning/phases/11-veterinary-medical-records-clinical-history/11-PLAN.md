---
status: planned
wave: 1
depends_on:
  - 10-premium-veterinary-appointment-calendar
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/pets/dto/create-clinical-records.dto.ts
  - backend/src/pets/dto/weight-record.dto.ts
  - backend/src/pets/dto/allergy-record.dto.ts
  - backend/src/pets/dto/vaccine-record.dto.ts
  - backend/src/pets/pets.service.ts
  - backend/src/pets/pets.controller.ts
  - frontend/src/lib/api.ts
  - frontend/src/App.tsx
  - frontend/src/pages/PetDetails.tsx
  - frontend/src/components/clinical-records/*
autonomous: true
---

# Plano da Fase 11: Prontuário Veterinário e Histórico Clínico

Este plano estabelece as etapas e tarefas para entregar o módulo premium de prontuários veterinários e histórico clínico de pacientes do VetOS AI.

---

## 1. Tarefa B-01: Modificar o Schema do Prisma e Executar Migração
- **files:**
  - `backend/prisma/schema.prisma`
- **read_first:**
  - `backend/prisma/schema.prisma`
- **action:**
  - Adicionar os modelos `WeightRecord`, `Allergy`, `VaccineRecord` e `ClinicalRecord` ao final do arquivo `schema.prisma`.
  - Definir os enums `AllergySeverity` (`LOW`, `MEDIUM`, `HIGH`) e `ClinicalRecordType` (`NOTE`, `PROCEDURE`, `CONSULTATION`).
  - Estabelecer relações entre cada novo modelo e a clínica (`Clinic`) e o paciente (`Pet`), garantindo a exclusão em cascata (`onDelete: Cascade`) em todas as chaves estrangeiras relacionadas ao Pet.
  - Rodar o comando `npx prisma db push` para atualizar e sincronizar as tabelas do banco de dados local Postgres.
- **acceptance_criteria:**
  - Os novos modelos e enums aparecem no arquivo `backend/prisma/schema.prisma`.
  - O comando `npx prisma db push` roda com sucesso e confirma que a sincronização de banco foi bem-sucedida.

## 2. Tarefa B-02: Criar DTOs de Prontuário e Validações no Backend
- **files:**
  - `backend/src/pets/dto/weight-record.dto.ts`
  - `backend/src/pets/dto/allergy-record.dto.ts`
  - `backend/src/pets/dto/vaccine-record.dto.ts`
  - `backend/src/pets/dto/clinical-record.dto.ts`
- **read_first:**
  - `backend/src/pets/dto` (se houver algum)
- **action:**
  - Criar o DTO `WeightRecordDto` com os campos `weight` (numérico, obrigatório) e `measuredAt` (data, opcional).
  - Criar o DTO `AllergyRecordDto` com os campos `name` (string, obrigatório), `severity` (enum `LOW`, `MEDIUM`, `HIGH`, obrigatório) e `notes` (string, opcional).
  - Criar o DTO `VaccineRecordDto` com os campos `name` (string, obrigatório), `appliedAt` (data, obrigatório), `nextDoseAt` (data, opcional), `lot` (string, opcional) e `veterinarian` (string, opcional).
  - Criar o DTO `ClinicalRecordDto` com os campos `type` (enum `NOTE`, `PROCEDURE`, `CONSULTATION`, obrigatório), `title` (string, obrigatório), `description` (string, obrigatório) e `performedAt` (data, opcional).
- **acceptance_criteria:**
  - Todas as classes de DTO estão criadas, exportadas e usam os validadores do pacote `class-validator`.
  - A tipagem no backend compila perfeitamente sem avisos ou erros.

## 3. Tarefa B-03: Estender PetsService para Registro Clínico com Proteção Multi-tenant
- **files:**
  - `backend/src/pets/pets.service.ts`
- **read_first:**
  - `backend/src/pets/pets.service.ts`
- **action:**
  - Implementar o método privado de validação de propriedade `validatePetOwnership(clinicId: string, petId: string): Promise<void>` que dispara `NotFoundException` caso o pet não pertença ao tenant logado.
  - Criar métodos para criar e deletar dados em cada coleção clínica:
    - Peso: `createWeight(clinicId, petId, data)`, `deleteWeight(clinicId, petId, id)`.
    - Alergia: `createAllergy(clinicId, petId, data)`, `deleteAllergy(clinicId, petId, id)`.
    - Vacina: `createVaccine(clinicId, petId, data)`, `deleteVaccine(clinicId, petId, id)`.
    - Registro Clínico (notas/procedimentos): `createClinicalRecord(clinicId, petId, data)`, `deleteClinicalRecord(clinicId, petId, id)`.
  - Implementar o método `getClinicalHistory(clinicId, petId)` que retorna o pet completo com todas as suas coleções associadas pré-carregadas (pesos ordenados por data ascendente, timeline clínica ordenada por data descendente, vacinas e alergias).
- **acceptance_criteria:**
  - Todos os novos métodos realizam validação obrigatória de tenant via `validatePetOwnership`.
  - O código do serviço compila sem qualquer tipo de erro de compilação ou do NestJS.

## 4. Tarefa B-04: Implementar Rotas no PetsController
- **files:**
  - `backend/src/pets/pets.controller.ts`
- **read_first:**
  - `backend/src/pets/pets.controller.ts`
- **action:**
  - Adicionar as seguintes rotas no `PetsController` sob a proteção do `JwtAuthGuard`:
    - **GET** `/:id/clinical-history` - Retorna todos os dados clínicos de um pet específico.
    - **POST** `/:id/weights` - Adiciona registro de peso do pet.
    - **DELETE** `/:id/weights/:recordId` - Remove registro de peso do pet.
    - **POST** `/:id/allergies` - Cadastra alergia no pet.
    - **DELETE** `/:id/allergies/:allergyId` - Remove alergia do pet.
    - **POST** `/:id/vaccines` - Adiciona vacina no pet.
    - **DELETE** `/:id/vaccines/:vaccineId` - Remove vacina do pet.
    - **POST** `/:id/records` - Adiciona nota ou procedimento clínico no prontuário.
    - **DELETE** `/:id/records/:recordId` - Exclui nota ou procedimento do prontuário.
  - Passar o `user.clinicId` obtido por `@CurrentUser()` e o `:id` do Pet obtido por `@Param('id') petId` para o `petsService`.
- **acceptance_criteria:**
  - Os endpoints correspondentes às coleções clínicas do paciente estão mapeados e compilando.

## 5. Tarefa F-01: Atualizar Tipagem e Cliente de API do Frontend
- **files:**
  - `frontend/src/lib/api.ts`
- **read_first:**
  - `frontend/src/lib/api.ts`
- **action:**
  - Adicionar as definições de tipo do TypeScript para as novas entidades: `WeightRecord`, `Allergy`, `VaccineRecord`, `ClinicalRecord`, `AllergySeverity` e `ClinicalRecordType`.
  - Atualizar o tipo `Pet` para opcionalmente conter coleções filhas de registros clínicos: `weightRecords`, `allergies`, `vaccineRecords`, `clinicalRecords`.
- **acceptance_criteria:**
  - As interfaces e enums do prontuário estão exportados corretamente no arquivo de APIs do frontend.
  - Nenhuma regra do compilador do TypeScript é violada nas novas tipagens.

## 6. Tarefa F-02: Adicionar Rota e Criar Página Detalhes do Pet (`PetDetails.tsx`)
- **files:**
  - `frontend/src/App.tsx`
  - `frontend/src/pages/PetDetails.tsx`
- **read_first:**
  - `frontend/src/App.tsx`
  - `frontend/src/pages/Pets.tsx`
- **action:**
  - Importar e configurar a rota protegida `/pets/:id` que renderiza o componente `<PetDetails />` em `frontend/src/App.tsx`.
  - Criar a página `PetDetails.tsx` com:
    - Botão estilizado para "Voltar para Pacientes".
    - Cabeçalho detalhado do Pet com informações de identificação (nome, espécie, raça, idade e o nome do tutor com link para a ficha dele).
    - Exibição de loaders (`Skeleton`) enquanto busca os dados em `/pets/:id/clinical-history`.
    - Navegação estilizada de 3 Abas: "Linha do Tempo Clínica", "Histórico de Vacinas" e "Saúde & Peso".
  - Fazer com que o clique no card do paciente em `frontend/src/pages/Pets.tsx` redirecione para `/pets/:id`.
- **acceptance_criteria:**
  - Usuários conseguem clicar em um paciente na listagem geral de Pets e ser redirecionado para a respectiva URL `/pets/:id`.
  - O esqueleto de carregamento premium é exibido com sucesso durante o carregamento de dados do prontuário.

## 7. Tarefa F-03: Implementar a Timeline Clínica e Registro de Notas
- **files:**
  - `frontend/src/components/clinical-records/ClinicalTimeline.tsx`
  - `frontend/src/components/clinical-records/ClinicalRecordModal.tsx`
  - `frontend/src/pages/PetDetails.tsx`
- **read_first:**
  - `frontend/src/pages/PetDetails.tsx`
- **action:**
  - Criar `ClinicalTimeline.tsx` que agrupa e renderiza consultas passadas (provenientes do histórico do Pet), procedimentos aplicados e notas de atendimento em ordem cronológica reversa.
  - Desenhar a timeline com uma linha vertical tracejada elegante e ícones coloridos por tipo de registro, seguindo o design de cores OKLCH definido no `11-UI-SPEC.md`.
  - Criar `ClinicalRecordModal.tsx` com formulário para cadastrar notas/procedimentos clínicos, salvando via POST para `/pets/:petId/records`.
  - Adicionar botão de exclusão de notas/procedimentos na timeline (DELETE para `/pets/:petId/records/:id`).
- **acceptance_criteria:**
  - O feed clínico exibe corretamente consultas, procedimentos e notas com datas e detalhes em formato PT-BR.
  - O cadastro de nova nota clínica reflete imediatamente na visualização sem recarregar a página e persiste ao recarregar.

## 8. Tarefa F-04: Implementar Painel de Peso, Curva Histórica e Alergias
- **files:**
  - `frontend/src/components/clinical-records/WeightChart.tsx`
  - `frontend/src/components/clinical-records/AllergiesList.tsx`
  - `frontend/src/components/clinical-records/AddAllergyModal.tsx`
  - `frontend/src/pages/PetDetails.tsx`
- **read_first:**
  - `frontend/src/pages/PetDetails.tsx`
- **action:**
  - Criar o gráfico `WeightChart.tsx` utilizando a biblioteca de gráficos existente do projeto para plotar a curva histórica do peso do paciente.
  - Adicionar modal ou formulário para adicionar pesagem e cadastrar via POST `/pets/:petId/weights`.
  - Criar `AllergiesList.tsx` com a listagem de alergias estruturadas por severidade (`LOW`, `MEDIUM`, `HIGH`) com cores vibrantes e contrastantes.
  - Criar modal de adição de alergia (`AddAllergyModal.tsx`) para permitir inclusão rápida de novos fatores alérgicos (POST `/pets/:petId/allergies`).
- **acceptance_criteria:**
  - A curva de peso plota corretamente os dados históricos cadastrados e adiciona novos pontos em tempo real.
  - As alergias aparecem ordenadas e são sinalizadas visualmente de forma contrastante no tema ativo (Light/Dark).

## 9. Tarefa F-05: Implementar o Controle de Vacinas e Próximas Doses
- **files:**
  - `frontend/src/components/clinical-records/VaccinesList.tsx`
  - `frontend/src/components/clinical-records/AddVaccineModal.tsx`
  - `frontend/src/pages/PetDetails.tsx`
- **read_first:**
  - `frontend/src/pages/PetDetails.tsx`
- **action:**
  - Criar `VaccinesList.tsx` exibindo a tabela organizada do histórico vacinal contendo: vacina, lote, profissional, aplicação e próxima dose estimada.
  - Criar modal de cadastro de vacinas aplicadas (`AddVaccineModal.tsx`) salvando os dados no banco de dados via POST `/pets/:petId/vaccines`.
  - Adicionar exclusão de registro vacinal cadastrado incorretamente (DELETE `/pets/:petId/vaccines/:id`).
- **acceptance_criteria:**
  - O histórico vacinal exibe corretamente os lotes e datas de retorno em formato amigável PT-BR.
  - O cadastro de novas vacinas atualiza o histórico e exibe as informações de forma limpa e premium.

---

## Verificação e Testes Manuais

Após a execução, realize os seguintes testes de validação:
1. **Banco de Dados:** Confirmar que as novas tabelas foram geradas corretamente no banco local Postgres via DBeaver ou prisma studio (`npx prisma studio`).
2. **Backend:** Compilar o backend (`npm run build` na pasta backend) para validar o TypeScript.
3. **Frontend:** Compilar o frontend (`npm run build` ou `tsc -b` na pasta frontend) para confirmar a integridade e ausência de erros.
4. **Resiliência Multi-tenant:** Testar no Postman ou Swagger se a chamada à API do prontuário bloqueia acessos de pets que pertencem a outro `clinicId` (outro tenant).
5. **Navegação e Layout:** Validar o clique no card de Pet abrindo a rota `/pets/:id`, com exibição premium em Bento Grid, navegação fluida entre abas, tema Light e Dark funcionando perfeitamente e layout responsivo testado no celular.

---

## Requisitos Mandatórios (Must Haves)

- Perfil do Pet completo e premium em `/pets/:id` integrada com layout em Bento Grid.
- Linha do Tempo Clínica (Clinical Timeline) unificada exibindo notas, procedimentos, consultas passadas e vacinas.
- Gráfico de curva histórica de peso do paciente ao longo do tempo.
- Registro e controle estruturado de alergias por severidade (`LOW`, `MEDIUM`, `HIGH`).
- Histórico tabular completo de vacinas contendo lote e próxima dose.
- Isolamento rígido de multi-tenant em todas as operações de prontuário baseando-se no `clinicId`.
- Suporte nativo completo a Light/Dark Theme no prontuário.
- Nenhuma dependência externa complexa ou não instalada adicionada (evitar drag-and-drop ou websockets).
