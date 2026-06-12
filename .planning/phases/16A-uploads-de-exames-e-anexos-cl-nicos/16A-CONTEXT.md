# Phase 16A: Uploads de Exames e Anexos Clínicos - Contexto

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar a funcionalidade de upload, validação e armazenamento seguro de exames e laudos clínicos vinculados ao prontuário clínico dos pets. O escopo abrange o desenvolvimento de endpoints de upload de arquivos no backend (NestJS) com validação de tamanho e tipo, armazenamento físico em disco com isolamento de tenant, e criação de uma interface de usuário premium no frontend (React) com dropzone de arrastar/soltar, cards de listagem e visualização de imagens.

</domain>

<decisions>
## Implementation Decisions

### Modelagem de Dados
- **D-01:** Criar uma nova tabela `ClinicalAttachment` no banco de dados vinculada obrigatoriamente a `Pet` e `Clinic` (para isolamento de tenant), e opcionalmente a `ClinicalRecord` (para permitir que exames fiquem avulsos no perfil do pet ou atrelados a uma nota clínica específica).
- **D-02:** A tabela `ClinicalAttachment` deve possuir exatamente os seguintes campos:
  - `id` (String/UUID - Chave Primária)
  - `clinicId` (String - Chave Estrangeira para Clinic)
  - `petId` (String - Chave Estrangeira para Pet)
  - `clinicalRecordId` (String, nullable - Chave Estrangeira opcional para ClinicalRecord)
  - `originalFileName` (String - Nome original do arquivo enviado)
  - `storedFileName` (String - Nome do arquivo salvo fisicamente no disco)
  - `mimeType` (String - Tipo MIME do arquivo)
  - `fileSize` (Int/BigInt - Tamanho do arquivo em bytes)
  - `storagePath` (String - Caminho físico do arquivo no armazenamento)
  - `uploadedById` (String, nullable - Identificador do usuário que fez o upload)
  - `notes` (String, nullable - Observações clínicas opcionais sobre o anexo)
  - `createdAt` (DateTime - Data de criação)
  - `updatedAt` (DateTime - Data de atualização)

### Estratégia de Armazenamento
- **D-03:** Salvar os arquivos físicos no sistema de arquivos local do backend (usando um volume persistente do Docker para desenvolvimento e staging), estruturado através de uma interface ou serviço abstrato (`StorageService`) para facilitar a chaveamento para provedores de nuvem (como AWS S3 ou Cloudflare R2) futuramente apenas trocando a implementação de serviço.
- **D-04:** Organizar as subpastas físicas de gravação de forma hierárquica por clínica e pet: `uploads/clinics/:clinicId/pets/:petId/:storedFileName`. Isso garante isolamento físico absoluto dos dados de cada tenant e facilita rotinas de migrações e backups de clínicas específicas.

### Políticas de Validação
- **D-05:** Definir o tamanho máximo permitido por arquivo de upload em 10 MB. Esse limite garante suporte a PDFs de exames detalhados e laudos de imagem pesados, mantendo o consumo de disco do servidor controlado.
- **D-06:** Aceitar estritamente arquivos nos formatos PDF e imagens web comuns (tipos MIME: `application/pdf`, `image/jpeg`, `image/png`), realizando validação de tipo MIME e extensão no NestJS (utilizando a biblioteca Multer).

### Interface de Usuário (UI/UX)
- **D-07:** Implementar um fluxo de interação duplo no frontend:
  - Uma aba dedicada chamada "Exames e Anexos" na página de prontuário (`PetDetails.tsx`) contendo um botão de upload direto de arquivos e a visualização de todos os anexos gerais do paciente.
  - A integração com o formulário de criação de notas/procedimentos clínicos na timeline, permitindo anexar arquivos que serão automaticamente associados ao respectivo `ClinicalRecord` recém-criado.
- **D-08:** Projetar a zona de upload como uma dropzone (arrastar e soltar) moderna com feedbacks de progresso em tempo real (barra ou spinner). Os arquivos carregados devem ser mostrados em cards elegantes com metadados legíveis (nome, tamanho do arquivo e data), ícones distintos para diferenciar PDFs de imagens, ações de exclusão e download, e visualização rápida (lightbox/preview) integrada para arquivos de imagem.

### the agent's Discretion
- Nomenclatura das rotas da API no backend (ex: `POST /pets/:petId/attachments`, `GET /pets/:petId/attachments`, `DELETE /attachments/:id`).
- Tecnologia de manipulação de formulários multipart/form-data no frontend e a configuração exata do middleware de upload (Multer) no NestJS.
- Estilos e transições visuais CSS (OKLCH/Tailwind) para os estados de hover da dropzone e animações de loading, respeitando as diretrizes dos temas Light/Dark.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Configuração e Fases
- `.planning/ROADMAP.md` — Definição da Fase 16A e vizinhas.
- `.planning/STATE.md` — Linha do tempo de progresso e estado do projeto.

### Banco de Dados (Prisma Schema)
- `backend/prisma/schema.prisma` — Contém as definições de `Clinic`, `Pet`, `ClinicalRecord`, e o novo modelo `ClinicalAttachment`.

### Lógica de Negócios (Backend)
- `backend/src/clinical-records/clinical-records.controller.ts` — Controladora de registros clínicos existente.
- `backend/src/clinical-records/clinical-records.service.ts` — Serviço de persistência e validação de registros clínicos.

### Interface de Usuário (Frontend)
- `frontend/src/pages/PetDetails.tsx` — Painel central onde a nova aba de anexos e o upload serão integrados.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `frontend/src/context/ThemeContext.tsx` e variáveis OKLCH no `index.css`: Devem ser usados para garantir que a dropzone e os cards de anexos se adaptem perfeitamente aos modos Light e Dark.

### Established Patterns
- Rotas protegidas por `JwtAuthGuard` e uso do decorator `@CurrentUser()` para validar tenant (`clinicId`) nas requisições.
- Validação de pertença do Pet à clínica logada no `clinical-records.service.ts` antes de realizar qualquer operação de banco de dados.

### Integration Points
- Nova aba no painel tabulado da página `PetDetails.tsx`.
- Modificação dos formulários de adição de Notas Clínicas para conter a zona de anexo de arquivos.

</code_context>

<specifics>
## Specific Ideas

- O upload no backend deve lançar exceções HTTP adequadas (ex: `PayloadTooLargeException` se exceder 10MB, `BadRequestException` se formato de arquivo for inválido).
- Exibição de previews de imagem leves para melhorar o carregamento da aba de anexos (gerando miniaturas ou renderizando a própria imagem com CSS otimizado de carregamento).

</specifics>

<deferred>
## Deferred Ideas

- Suporte a upload e leitura/conversão de arquivos médicos DICOM (.dcm).
- Zip de arquivos e downloads em lote.
- Integração de produção com AWS S3 / Cloudflare R2 direto pelo backend (postergado para fases de faturamento/SaaS/billing).

</deferred>

---

*Phase: 16A-Uploads de Exames e Anexos Clínicos*
*Context gathered: 2026-06-11*
