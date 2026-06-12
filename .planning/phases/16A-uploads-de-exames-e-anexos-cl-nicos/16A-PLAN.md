---
phase: "16A"
plan: "16A-01"
type: "execute"
wave: 1
depends_on: []
files_modified:
  - backend/prisma/schema.prisma
  - backend/src/app.module.ts
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
    - "D-03: StorageService abstrato configurado para persistência de arquivos"
    - "D-04: Organização física hierárquica por clínica e pet"
    - "D-05: Upload de arquivo limitado a 10MB máximo"
    - "D-06: Apenas formatos PDF, JPEG, PNG aceitos pelo backend"
    - "D-07: Fluxo de anexação no prontuário e nas evoluções clínicas"
    - "D-08: Componentes de Dropzone, AttachmentCard e Lightbox integrados no frontend"
---

# Fase 16A: Uploads de Exames e Anexos Clínicos - Plano de Implementação

Este plano define os passos necessários para implementar o upload, validação e armazenamento seguro de exames e laudos clínicos vinculados ao prontuário clínico dos pets, englobando a modelagem do banco de dados, APIs do backend (NestJS) com Multer, isolamento físico de tenant, e a interface frontend (React) com dropzone, listagem e preview lightbox.

## Critérios de Aceitação (UAT)

1. **Modelagem de Dados & Schema Push** (D-01, D-02):
   - Criar o modelo `ClinicalAttachment` no schema do Prisma e executar `npx prisma db push` para aplicar a alteração da base de dados e atualização do Prisma Client.
2. **Backend: Upload, Validação e Armazenamento** (D-03, D-04, D-05, D-06):
   - Endpoint `POST /pets/:petId/attachments` aceita arquivo `multipart/form-data` com limite de 10 MB, rejeitando formatos proibidos e tamanho excessivo.
   - Organizar armazenamento em `/uploads/clinics/:clinicId/pets/:petId/:storedFileName`.
   - Endpoint `GET /pets/:petId/attachments` lista metadados de todos os anexos do pet logado.
   - Endpoint `GET /attachments/:id/download` serve o stream do arquivo físico para download.
   - Endpoint `DELETE /attachments/:id` remove os metadados do banco de dados e exclui fisicamente o arquivo do disco.
3. **Isolamento de Tenant (Multi-tenant)**:
   - Toda operação de upload, listagem, download e exclusão deve validar se o pet e os registros pertencem estritamente à clínica do usuário logado (`clinicId`).
4. **Interface Frontend (UI/UX)** (D-07, D-08):
   - Integrar abas superiores ("Histórico Clínico" e "Exames e Anexos") em `PetDetails.tsx`.
   - Área de Dropzone interativa com barra de progresso linear de upload.
   - Listagem responsiva com cards contendo metadados, ícones distintos do `lucide-react` para PDFs e Imagens, e ações de download e exclusão.
   - Visualização Lightbox para imagens usando `@radix-ui/react-dialog`.

---

## Modelo de Ameaças (Threat Model)

- **T-16A-01: Upload de Arquivos Maliciosos (RCE)**
  - *Mitigação*: Validação estrita do MIME-type do arquivo no backend usando Multer e assinatura do cabeçalho. Arquivos são salvos com nomes randômicos UUID sem executar extensões do lado do servidor.
- **T-16A-02: Vazamento de Dados Multi-tenant (Acesso Não Autorizado)**
  - *Mitigação*: Uso de UUIDs aleatórios para os arquivos e metadados. Validação obrigatória da propriedade da clínica (`clinicId` extraído do JWT) em todos os endpoints de acesso a anexos.
- **T-16A-03: Excesso de Armazenamento (DoS)**
  - *Mitigação*: Limite máximo rígido de 10 MB por arquivo imposto pelo Multer.

---

## Tarefas por Componente

### Wave 1: Banco de Dados e Backend

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

#### [NEW] [clinical-attachments.module.ts](file:///home/moadev/projetos/vetOSAI/backend/src/clinical-attachments/clinical-attachments.module.ts)
<task id="16A-01-02">
  <name>Criar Módulo de Anexos Clínicos no NestJS</name>
  <files>
    - backend/src/app.module.ts
    - backend/src/clinical-attachments/clinical-attachments.module.ts
  </files>
  <action>
    Criar o arquivo do módulo para encapsular a injeção do controller, service e do PrismaService. Importar este módulo no `app.module.ts`.
  </action>
  <verify>
    Executar build do backend para validar a importação correta do módulo.
  </verify>
  <done>
    Módulo compilando com sucesso no NestJS e importado no módulo raiz.
  </done>
</task>

#### [NEW] [clinical-attachments.service.ts](file:///home/moadev/projetos/vetOSAI/backend/src/clinical-attachments/clinical-attachments.service.ts)
<task id="16A-01-03">
  <name>Criar Serviço do Backend para Persistência e Gravação Física</name>
  <files>
    - backend/src/clinical-attachments/clinical-attachments.service.ts
  </files>
  <action>
    Implementar a lógica de negócios de D-03, D-04, D-05 e D-06:
    - Criar dinamicamente pastas locais `uploads/clinics/:clinicId/pets/:petId/` usando `fs.mkdirSync`.
    - Salvar o arquivo recebido com nome UUID gerado aleatoriamente e mantendo a extensão.
    - Gravar registros de metadados de `ClinicalAttachment` no Prisma.
    - Excluir o arquivo correspondente do sistema de arquivos físico ao remover o registro.
  </action>
  <verify>
    Verificar que o arquivo service existe e expõe os métodos de salvar e deletar anexos clínicos.
  </verify>
  <done>
    Serviço de gravação física e banco de dados concluído com segurança multi-tenant.
  </done>
</task>

#### [NEW] [clinical-attachments.controller.ts](file:///home/moadev/projetos/vetOSAI/backend/src/clinical-attachments/clinical-attachments.controller.ts)
<task id="16A-01-04">
  <name>Criar Controller do Backend com Filtros do Multer</name>
  <files>
    - backend/src/clinical-attachments/clinical-attachments.controller.ts
  </files>
  <action>
    Implementar rotas NestJS controlando o fluxo de requisição:
    - `POST /pets/:petId/attachments`: intercepta o upload usando Multer, aplicando limites de tamanho de 10MB (D-05) e tipos MIME de PDF, JPEG e PNG (D-06).
    - `GET /pets/:petId/attachments`: lista anexos do pet.
    - `GET /attachments/:id/download`: serve o arquivo físico como stream de forma segura.
    - `DELETE /attachments/:id`: remove anexo.
  </action>
  <verify>
    Verificar que o controller está compilando e escutando as rotas especificadas.
  </verify>
  <done>
    Rotas de controller implementadas com autenticação JWT e validação do Multer.
  </done>
</task>

#### [NEW] [clinical-attachments.service.spec.ts](file:///home/moadev/projetos/vetOSAI/backend/src/clinical-attachments/clinical-attachments.service.spec.ts)
<task id="16A-01-05">
  <name>Criar Testes de Unidade e Integração do Backend</name>
  <files>
    - backend/src/clinical-attachments/clinical-attachments.service.spec.ts
  </files>
  <action>
    Implementar suite de testes unitários Jest cobrindo validações de tamanho, mimetypes e testes de vazamento de tenant (download de anexo de outra clínica).
  </action>
  <verify>
    Executar a suite de testes no backend via: `npm --prefix backend test`
  </verify>
  <done>
    Testes de unidade passando e com cobertura de validações críticas.
  </done>
</task>

---

### Wave 2: Frontend UI

#### [MODIFY] [api.ts](file:///home/moadev/projetos/vetOSAI/frontend/src/lib/api.ts)
<task id="16A-02-01">
  <name>Integrar Endpoints da API de Anexos no Frontend</name>
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
  <name>Refatorar Página PetDetails para incluir Abas, Dropzone e Cards</name>
  <files>
    - frontend/src/pages/PetDetails.tsx
  </files>
  <action>
    Refatorar a página do prontuário para adicionar navegação de abas no topo da timeline (D-07). Criar a aba "Exames e Anexos" contendo:
    - Componente Dropzone reativo a eventos de arrastar/soltar com barra de progresso (D-08).
    - Grid responsivo de cards elegantes exibindo metadados e botões de download e exclusão com modal de confirmação.
    - Modal de visualização rápida Lightbox para imagens.
    - Integração de anexo simplificado no formulário de notas clínicas/evolução.
  </action>
  <verify>
    Executar build do frontend: `npm --prefix frontend run build` e verificar que passa com sucesso.
  </verify>
  <done>
    Interface do Prontuário refatorada com abas, Dropzone, listagem e preview de imagens.
  </done>
</task>

---

## Plano de Verificação

### Testes Automatizados
- Executar a suite de testes no backend:
  `npm --prefix backend test`

### Testes Manuais
- Fazer upload de arquivo acima de 10MB e verificar rejeição HTTP 413.
- Tentar baixar anexo de outra clínica e verificar barreira HTTP 404/403.
- Testar o comportamento visual da Dropzone, cards responsivos e preview Lightbox.
