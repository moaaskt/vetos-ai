---
phase: "16A"
plan: "16A-01"
type: "execute"
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/app.module.ts
  - backend/src/storage/storage.module.ts
  - backend/src/storage/storage.service.ts
  - backend/src/storage/local-storage.service.ts
  - backend/src/storage/local-storage.service.spec.ts
  - backend/src/clinical-attachments/clinical-attachments.module.ts
  - backend/src/clinical-attachments/clinical-attachments.controller.ts
  - backend/src/clinical-attachments/clinical-attachments.service.ts
  - backend/src/clinical-attachments/clinical-attachments.service.spec.ts
  - frontend/src/lib/api.ts
  - frontend/src/pages/PetDetails.tsx
autonomous: true
requirements:
  - REQ-16A.1
  - REQ-16A.2
  - REQ-16A.3
  - REQ-16A.4
  - REQ-16A.5
  - REQ-16A.6
must_haves:
  truths:
    - "D-01: Tabela ClinicalAttachment criada e relacionada a Pet, Clinic, ClinicalRecord e User"
    - "D-02: Colunas e campos de ClinicalAttachment mapeados"
    - "D-03: StorageService abstrato configurado para persistência de arquivos sem acoplamento direto"
    - "D-04: Organização física hierárquica por clínica e pet"
    - "D-05: Upload de arquivo limitado a 10MB máximo"
    - "D-06: Suporte a arquivos PDF, JPEG, PNG e WEBP no backend (Multer e pipes)"
    - "D-07: Fluxo de anexação no prontuário e nas evoluções clínicas"
    - "D-08: Componentes de Dropzone (com suporte a WEBP), AttachmentCard e Lightbox integrados no frontend"
---

# Fase 16A: Uploads de Exames e Anexos Clínicos - Plano de Implementação (Ajustado)

Este plano define os passos necessários para implementar o upload, validação e armazenamento seguro de exames e laudos clínicos vinculados ao prontuário clínico dos pets. A arquitetura de persistência física foi desacoplada no `StorageModule`, e foi incluído suporte completo ao formato **WEBP** para imagens no backend e frontend.

## Critérios de Aceitação (UAT)

1. **Modelagem de Dados & Schema Push** (D-01, D-02):
   - Criar o modelo `ClinicalAttachment` no schema do Prisma e executar `npx prisma db push` com sucesso.
2. **Backend: Armazenamento Abstrato e Validação** (D-03, D-04, D-05, D-06):
   - Criar o `StorageModule` com a classe abstrata `StorageService` e sua implementação local `LocalStorageService`.
   - Lançar `PayloadTooLargeException` se arquivos excederem 10 MB.
   - Restringir mimetypes no Multer apenas para: `application/pdf`, `image/jpeg`, `image/png` e `image/webp`.
   - Organizar armazenamento em `/uploads/clinics/:clinicId/pets/:petId/:storedFileName`.
   - Endpoint `GET /pets/:petId/attachments` lista metadados de todos os anexos do pet logado.
   - Endpoint `GET /attachments/:id/download` serve o stream do arquivo físico para download.
   - Endpoint `DELETE /attachments/:id` remove os metadados do banco de dados e exclui fisicamente o arquivo do disco através do `StorageService`.
3. **Isolamento de Tenant (Multi-tenant)**:
   - Validação estrita de `clinicId` em todas as ações de upload, download e exclusão.
4. **Interface Frontend (UI/UX)** (D-07, D-08):
   - Integrar abas superiores ("Histórico Clínico" e "Exames e Anexos") em `PetDetails.tsx`.
   - Dropzone aceitando e validando formatos incluindo `.webp`.
   - Cards responsivos com previews funcionais para imagens (JPEG, PNG, WEBP), botão de download e exclusão.
   - Visualização Lightbox para imagens usando `@radix-ui/react-dialog`.

---

## Modelo de Ameaças (Threat Model)

- **T-16A-01: Upload de Arquivos Maliciosos (RCE)**
  - *Mitigação*: Validação estrita de MIME-type no backend usando Multer. Arquivos são salvos com nomes randômicos UUID sem executar extensões do lado do servidor.
- **T-16A-02: Vazamento de Dados Multi-tenant (Acesso Não Autorizado)**
  - *Mitigação*: Validação obrigatória do `clinicId` extraído do JWT em todas as rotas e persistência física isolada por clínica.
- **T-16A-03: Excesso de Armazenamento (DoS)**
  - *Mitigação*: Limite máximo rígido de 10 MB por arquivo imposto pelo Multer.

---

## Tarefas por Componente

### Wave 1: Banco de Dados, Módulo de Storage e Backend

#### [MODIFY] [schema.prisma](file:///home/moadev/projetos/vetOSAI/backend/prisma/schema.prisma)
<task id="16A-01-01">
  <name>Declarar Modelo no Prisma e Executar Schema Push</name>
  <files>
    - backend/prisma/schema.prisma
  </files>
  <action>
    Adicionar o modelo `ClinicalAttachment` de acordo com D-01 e D-02. Definir relações com Clinic, Pet, ClinicalRecord e User. Executar o comando `npx prisma db push` para aplicar a alteração e regenerar o Prisma Client.
  </action>
  <verify>
    Confirmar que o arquivo schema.prisma foi modificado e executar npx prisma db push sem apresentar erros.
  </verify>
  <done>
    Modelo ClinicalAttachment declarado no prisma schema e banco sincronizado.
  </done>
</task>

#### [NEW] Módulo de Storage Abstrato
<task id="16A-01-02">
  <name>Criar Módulo de Armazenamento Desacoplado (StorageModule)</name>
  <files>
    - backend/src/storage/storage.module.ts
    - backend/src/storage/storage.service.ts
    - backend/src/storage/local-storage.service.ts
    - backend/src/storage/local-storage.service.spec.ts
  </files>
  <action>
    Implementar o encapsulamento de armazenamento físico (D-03, D-04):
    - `storage.service.ts`: classe abstrata contendo assinaturas `save`, `delete`, `getFileStream` e `exists`.
    - `local-storage.service.ts`: implementação concreta para gravação física em disco local (`fs.promises` e `createReadStream`), organizando arquivos em `uploads/clinics/:clinicId/pets/:petId/`.
    - `storage.module.ts`: prover o provider de injeção ligando `StorageService` ao `LocalStorageService`.
    - `local-storage.service.spec.ts`: suite de testes Jest validando operações básicas de disco.
  </action>
  <verify>
    Executar os testes de unidade de storage: `npm --prefix backend test storage` e verificar sucesso.
  </verify>
  <done>
    StorageModule criado, implementando interface abstrata com cobertura de testes Jest.
  </done>
</task>

#### [NEW] Módulo de Anexos Clínicos (NestJS)
<task id="16A-01-03">
  <name>Criar Módulo, Controladora e Serviço de Anexos Clínicos</name>
  <files>
    - backend/src/app.module.ts
    - backend/src/clinical-attachments/clinical-attachments.module.ts
    - backend/src/clinical-attachments/clinical-attachments.controller.ts
    - backend/src/clinical-attachments/clinical-attachments.service.ts
  </files>
  <action>
    Implementar o fluxo de negócio do domínio de anexos:
    - `clinical-attachments.module.ts`: importar `StorageModule` para injetar `StorageService` de forma transparente. Registrar no `app.module.ts`.
    - `clinical-attachments.controller.ts`: rotas `POST`, `GET`, `DELETE` e download. Adicionar FileInterceptor do Multer limitando a 10MB (D-05) e tipos MIME PDF, JPEG, PNG, e WEBP (D-06).
    - `clinical-attachments.service.ts`: injetar `StorageService` e manipula metadados no Prisma, validando multi-tenant por `clinicId` em todas as operações de gravação e consulta.
  </action>
  <verify>
    Executar o build do backend para validar a compilação do NestJS.
  </verify>
  <done>
    Módulo de anexos integrado, consumindo o StorageService de forma abstrata.
  </done>
</task>

#### [NEW] Testes do Módulo de Anexos Clínicos
<task id="16A-01-04">
  <name>Criar Testes de Unidade e Integração para Endpoints e Filtros</name>
  <files>
    - backend/src/clinical-attachments/clinical-attachments.service.spec.ts
  </files>
  <action>
    Implementar suite de testes unitários Jest cobrindo validações de tamanho, mimetypes (incluindo aceitação de WEBP e rejeição de formatos inválidos) e testes de vazamento de tenant (download de anexo de outra clínica).
  </action>
  <verify>
    Executar a suite de testes completa do backend via: `npm --prefix backend test`
  </verify>
  <done>
    Testes de unidade passando e com cobertura de validações críticas.
  </done>
</task>

---

### Wave 2: Frontend UI

#### [MODIFY] [api.ts](file:///home/moadev/projetos/vetOSAI/frontend/src/lib/api.ts)
<task id="16A-02-01">
  <name>Integrar Endpoints da API no Cliente HTTP do Frontend</name>
  <files>
    - frontend/src/lib/api.ts
  </files>
  <action>
    Declarar interfaces TypeScript de anexo clínico e adicionar endpoints via Axios: `uploadAttachment`, `getAttachments`, `downloadAttachment`, e `deleteAttachment`.
  </action>
  <verify>
    Verificar que o build do frontend compila sem erros de importação/tipagem.
  </verify>
  <done>
    Interfaces e chamadas do cliente HTTP adicionados no frontend.
  </done>
</task>

#### [MODIFY] [PetDetails.tsx](file:///home/moadev/projetos/vetOSAI/frontend/src/pages/PetDetails.tsx)
<task id="16A-02-02">
  <name>Refatorar Página PetDetails para Abas, Dropzone e Cards</name>
  <files>
    - frontend/src/pages/PetDetails.tsx
  </files>
  <action>
    Refatorar a página do prontuário para adicionar navegação de abas no topo da timeline (D-07). Criar a aba "Exames e Anexos" contendo:
    - Componente Dropzone reativo a eventos de arrastar/soltar com barra de progresso, aceitando formatos PDF, JPEG, PNG e WEBP (D-08).
    - Grid responsivo de cards elegantes exibindo metadados, botão de download e exclusão com modal de confirmação.
    - Imagens em formato WEBP/PNG/JPEG terão previews visuais na lista e abrirão no lightbox.
    - Integração de anexo simplificado no formulário de notas clínicas/evolução.
  </action>
  <verify>
    Executar build do frontend: `npm --prefix frontend run build` e verificar que passa com sucesso.
  </verify>
  <done>
    Interface do Prontuário refatorada com abas, Dropzone (suporte a WEBP), listagem e preview de imagens.
  </done>
</task>

---

## Plano de Verificação

### Testes Automatizados
- Executar a suite de testes no backend:
  `npm --prefix backend test`

### Testes Manuais
- Fazer upload de arquivo WEBP, PNG, JPEG e PDF para garantir que sejam aceitos.
- Tentar fazer upload de arquivos `.txt` ou scripts `.js` e verificar erro HTTP 400.
- Fazer upload de arquivo acima de 10MB e verificar rejeição HTTP 413.
- Tentar baixar anexo de outra clínica e verificar barreira HTTP 404/403.
- Testar o comportamento visual da Dropzone, cards responsivos e preview Lightbox de imagens (incluindo WEBP).
