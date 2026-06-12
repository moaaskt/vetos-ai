# Phase 16A: Uploads de Exames e Anexos Clínicos - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-12T03:13:30Z
**Phase:** 16A-Uploads de Exames e Anexos Clínicos
**Areas discussed:** Modelagem de Dados, Estratégia de Armazenamento, Políticas de Validação, Interface de Usuário

---

## Modelagem de Dados

### Pergunta 1: Como os exames e anexos clínicos serão estruturados e vinculados no banco de dados (Prisma Schema)?

| Option | Description | Selected |
|--------|-------------|----------|
| Nova tabela | Criar uma nova tabela 'Attachment' vinculada obrigatoriamente a 'Pet' e opcionalmente a 'ClinicalRecord' (Permite múltiplos anexos por prontuário ou arquivos avulsos no perfil do pet) | ✓ |
| Tabela associada | Criar uma tabela 'ClinicalRecordAttachment' vinculada obrigatoriamente a 'ClinicalRecord' (Todos os arquivos precisam obrigatoriamente pertencer a uma nota de prontuário) | |
| Campos diretos | Adicionar campos de arquivo diretamente no 'ClinicalRecord' (Mais simples, mas limita a um arquivo por registro clínico) | |

**User's choice:** Criar uma nova tabela 'Attachment' vinculada obrigatoriamente a 'Pet' e opcionalmente a 'ClinicalRecord'.
**Notes:** Permite maior flexibilidade de anexar múltiplos arquivos por nota ou arquivos avulsos na ficha do animal.

### Pergunta 2: Quais metadados e campos adicionais a tabela 'Attachment' deve armazenar?

| Option | Description | Selected |
|--------|-------------|----------|
| Completo | Metadados completos do arquivo (fileName, fileUrl, fileType/MIME, fileSize) + título customizável opcional e clinicId para isolamento de tenant | |
| Básico | Apenas o básico (fileName, fileUrl) sem armazenar tipo MIME e tamanho de forma explícita no banco de dados | |
| Avançado + Notas | Metadados do arquivo + campo de notas/observações do veterinário para cada anexo | ✓ |

**User's choice:** Opção 3 (Metadados do arquivo + campo de notas/observações do veterinário para cada anexo) com a especificação manual da tabela.
**Notes:** O usuário especificou que a tabela deve se chamar `ClinicalAttachment` e possuir as colunas: `id`, `clinicId`, `petId`, `clinicalRecordId` (nullable), `originalFileName`, `storedFileName`, `mimeType`, `fileSize`, `storagePath`, `uploadedById`, `notes` (nullable e opcional), `createdAt`, `updatedAt`.

---

## Estratégia de Armazenamento

### Pergunta 1: Onde e como os arquivos de exames clínicos enviados serão salvos fisicamente?

| Option | Description | Selected |
|--------|-------------|----------|
| Local + Abstração | Armazenamento local no sistema de arquivos (com volume persistente no Docker) abstraído por um 'StorageService' (permite chavear para S3/nuvem futuramente apenas mudando a implementação do serviço) | ✓ |
| Híbrido | Armazenamento híbrido configurável (local para desenvolvimento e AWS S3 / Cloudflare R2 para produção chaveado por variáveis de ambiente) | |
| Fixo Local | Salvar apenas local no disco de forma fixa, sem abstração para S3/nuvem | |

**User's choice:** Armazenamento local no sistema de arquivos abstraído por um `StorageService`.
**Notes:** Mantém a simplicidade de infraestrutura atual e a facilidade de migrar para nuvem no futuro apenas redefinindo a classe de serviço.

### Pergunta 2: Como os arquivos salvos no disco devem ser organizados em subpastas?

| Option | Description | Selected |
|--------|-------------|----------|
| Estruturado | Estrutura organizada por tenant e paciente: 'uploads/clinics/:clinicId/pets/:petId/:storedFileName' (Melhor isolamento físico de dados por clínica/pet e facilita backups individuais) | ✓ |
| UUID Simples | Pasta única 'uploads/' com arquivos renomeados por UUID para evitar colisões (ex: 'uploads/:uuid.extension') | |
| Tenant Simples | Pasta organizada apenas por clínica: 'uploads/clinics/:clinicId/:storedFileName' | |

**User's choice:** Estrutura organizada por tenant e paciente: `uploads/clinics/:clinicId/pets/:petId/:storedFileName`.
**Notes:** Fornece o melhor isolamento físico por clínica e paciente, facilitando backups e auditorias.

---

## Políticas de Validação

### Pergunta 1: Qual deve ser o tamanho máximo de arquivo permitido por upload?

| Option | Description | Selected |
|--------|-------------|----------|
| 10 MB | 10 MB por arquivo (Equilíbrio ideal para receber PDFs detalhados e imagens de alta qualidade sem sobrecarregar o armazenamento) | ✓ |
| 5 MB | 5 MB por arquivo (Mais econômico para o armazenamento local, mas pode limitar PDFs de exames extensos) | |
| 20 MB | 20 MB por arquivo (Garante que exames muito grandes passem, mas aumenta o consumo de banda e armazenamento) | |

**User's choice:** 10 MB por arquivo.
**Notes:** Opção padrão e ideal para arquivos de PDF de laudos e imagens radiográficas.

### Pergunta 2: Quais formatos e tipos de arquivos (MIME-types) serão aceitos pelo sistema?

| Option | Description | Selected |
|--------|-------------|----------|
| Padrão Web | Apenas PDFs e imagens web comuns (application/pdf, image/jpeg, image/png) - cobre a quase totalidade dos laudos e fotos de exames | ✓ |
| Office | PDFs, imagens comuns e arquivos do Microsoft Office (Word/Excel: .docx, .xlsx, .doc, .xls) | |
| Irrestrito | Permitir qualquer formato (incluindo imagens médicas DICOM - .dcm), validando apenas para bloquear executáveis/arquivos perigosos | |

**User's choice:** Apenas PDFs e imagens web comuns (JPEG, PNG e PDF).
**Notes:** Suficiente para a grande maioria das necessidades operacionais diárias.

---

## Interface de Usuário

### Pergunta 1: Como os veterinários deverão gerenciar e visualizar os arquivos no prontuário do Pet?

| Option | Description | Selected |
|--------|-------------|----------|
| Fluxo Duplo | Fluxo duplo: Aba dedicada 'Exames e Anexos' em PetDetails para visualização global e upload direto, mais a capacidade de anexar arquivos ao criar novas Notas Clínicas | ✓ |
| Aba apenas | Aba dedicada 'Exames e Anexos' apenas (exibe todos os arquivos do pet num local centralizado com upload avulso, sem associar a notas da timeline) | |
| Timeline apenas | Apenas acoplado à timeline (os uploads são feitos e exibidos estritamente dentro das notas de prontuário, sem painel de arquivos centralizado) | |

**User's choice:** Fluxo duplo (Aba de visualização global com upload avulso + anexação rápida na criação de notas).
**Notes:** Oferece excelente UX e facilidade no fluxo de trabalho clínico.

### Pergunta 2: Como deve ser o design da zona de upload e da listagem de arquivos concluídos no frontend?

| Option | Description | Selected |
|--------|-------------|----------|
| Premium dropzone | Área drag-and-drop premium (dropzone) com progresso em tempo real, exibindo os anexos como cards com ícones personalizados por tipo (PDF vs. Imagens), metadados legíveis e visualização rápida (lightbox/preview) para imagens | ✓ |
| Tabela simples | Listagem simples em tabela com colunas de nome do arquivo, tipo, tamanho, autor, ação de download e exclusão, com botão de upload convencional | |
| Cards minimalistas | Cards minimalistas sem visualização rápida de imagem, abrindo todos os arquivos em nova guia do navegador | |

**User's choice:** Área drag-and-drop premium com progresso, cards estruturados e lightbox de preview para fotos.
**Notes:** Alinhado com as premissas de UX premium e OKLCH visual do VetOS AI.

---

## the agent's Discretion

- Rotas de endpoints no NestJS.
- Tratamento multipart/form-data e Multer no NestJS e Axios no React.
- Design visual e animações de hover/loading utilizando Tailwind e paleta OKLCH do projeto.

## Deferred Ideas

- Leitor e upload de formato médico bruto DICOM (.dcm).
- Agrupamento zip de exames para download.
- Armazenamento em AWS S3 / Cloudflare R2 nativo (postergado para fases de Billing/Infra).
