# Phase 16A — Technical Research

## Visão Geral do Domínio

A Fase 16A introduz o upload de arquivos médicos e laudos (PDFs e imagens) atrelados ao prontuário de cada paciente (`Pet`). O fluxo de dados requer que o backend receba, valide, grave localmente de forma isolada por clínica (tenant) e registre na base de dados os metadados em uma nova tabela `ClinicalAttachment`. O frontend consumirá estes registros, permitindo o download, exclusão e visualização de previews de imagem, além de integrar o upload no próprio formulário de registros clínicos (`ClinicalRecord`).

---

## 1. Banco de Dados (Prisma Schema)

De acordo com as decisões do contexto, o novo modelo `ClinicalAttachment` deve ser definido no `backend/prisma/schema.prisma` da seguinte forma:

```prisma
model ClinicalAttachment {
  id               String          @id @default(uuid())
  clinicId         String
  petId            String
  clinicalRecordId String?
  originalFileName String
  storedFileName   String
  mimeType         String
  fileSize         BigInt          // Suporta arquivos grandes com precisão em bytes
  storagePath      String
  uploadedById     String?
  notes            String?
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  clinic         Clinic          @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  pet            Pet             @relation(fields: [petId], references: [id], onDelete: Cascade)
  clinicalRecord ClinicalRecord? @relation(fields: [clinicalRecordId], references: [id], onDelete: SetNull)
  uploadedBy     User?           @relation(fields: [uploadedById], references: [id], onDelete: SetNull)

  @@index([clinicId])
  @@index([petId])
  @@index([clinicalRecordId])
  @@index([uploadedById])
}
```

### Relações Reversas a adicionar nos modelos existentes:
- No modelo `Clinic`: `clinicalAttachments ClinicalAttachment[]`
- No modelo `Pet`: `clinicalAttachments ClinicalAttachment[]`
- No modelo `ClinicalRecord`: `attachments ClinicalAttachment[]`
- No modelo `User`: `uploadedAttachments ClinicalAttachment[]`

---

## 2. Validações e Middleware (Multer no NestJS)

O upload de arquivos será processado via `multipart/form-data`. O NestJS possui integração nativa com o **Multer** através de interceptors como `@UseInterceptors(FileInterceptor('file'))`.

### Regras de Validação Rígidas (Multer Option Factory / NestJS Pipes):
1. **Limite de Tamanho**: 10 MB (10.485.760 bytes). Arquivos maiores devem lançar imediatamente `PayloadTooLargeException` (HTTP 413).
2. **Tipos de Arquivos Permitidos**: Apenas `application/pdf`, `image/jpeg`, `image/png`. Outros formatos devem lançar `BadRequestException` (HTTP 400).
3. **Validação Físicas (MIME-Type)**: A validação será feita via `fileFilter` do Multer no backend para impedir extensões mascaradas.

Exemplo de implementação do interceptor com filtro no controller/module:
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype)) {
      return callback(new BadRequestException('Formato de arquivo inválido. Apenas PDF, JPEG e PNG são permitidos.'), false);
    }
    callback(null, true);
  }
}))
```

---

## 3. Isolamento de Tenant e Armazenamento Persistente

Para garantir conformidade regulatória e isolamento de dados de múltiplos tenants:
- **Caminho Físico**: `/uploads/clinics/:clinicId/pets/:petId/:storedFileName`.
- **Prevenção de Colisões**: O nome gravado no disco será um UUID gerado randomicamente (`uuid() + ext`) para evitar sobrescrita de arquivos com nomes idênticos e dificultar acessos arbitrários caso caminhos sejam expostos.
- **Armazenamento Abstrato**: O backend terá um `StorageService` abstrato que manipula a persistência em disco local nesta fase, mas com assinaturas que facilitem a substituição futura por um driver do AWS S3 ou Cloudflare R2:
  ```typescript
  interface StorageService {
    save(path: string, buffer: Buffer): Promise<string>;
    get(path: string): Promise<Buffer>;
    delete(path: string): Promise<void>;
  }
  ```
- **Segurança de Acesso**: Todos os downloads e acessos de arquivos passarão por um endpoint do NestJS (ex: `/pets/:petId/attachments/:id/download`) protegido por `JwtAuthGuard`. O backend validará se o `clinicId` associado ao anexo pertence ao tenant do usuário logado antes de servir o arquivo físico via stream. Acesso direto por URL estática não será permitido.

---

## Validation Architecture (Arquitetura de Validação Nyquist)

Para seguir a conformidade de Nyquist e garantir que não haja regressões ou furos de segurança, implementaremos os seguintes testes automatizados de backend usando **Jest**:

1. **Testes Unitários/Integração (Controller & Service)**:
   - `clinical-attachments.service.spec.ts` / `clinical-attachments.controller.spec.ts`:
     - Testar que o upload de arquivo válido gera os metadados no banco e persiste o arquivo no caminho do tenant correto.
     - Testar que arquivos com MIME-types proibidos (ex: `text/html`, `application/javascript`) são rejeitados com HTTP 400.
     - Testar que arquivos maiores de 10 MB são rejeitados com HTTP 413.
     - Testar que o download de um anexo de outra clínica (outro `clinicId`) retorna HTTP 404/403.
     - Testar que a remoção física do arquivo ocorre quando o anexo é excluído no banco de dados.

---

## 5. Interface do Usuário (Frontend)

- **Aba de Anexos**: Criar barra de navegação superior na coluna da esquerda de `PetDetails.tsx` chaveando entre "Histórico Clínico" e "Exames e Anexos".
- **Dropzone**: Usar eventos de drag & drop do React (`onDragOver`, `onDragLeave`, `onDrop`).
- **Cards de Listagem**: Layout em grid com flexbox, ícones do `lucide-react` para PDFs (`FileText`) e imagens (`Image`).
- **Lightbox Preview**: Usar `@radix-ui/react-dialog` de forma simplificada no frontend para abrir o preview de imagens carregadas de forma fluida.

---

## ## RESEARCH COMPLETE
