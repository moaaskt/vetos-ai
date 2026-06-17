# Phase 16A — Technical Research (Ajustado com StorageService & WEBP)

## Visão Geral do Domínio

A Fase 16A introduz o upload de arquivos médicos e laudos (PDFs e imagens, incluindo WEBP) atrelados ao prontuário de cada paciente (`Pet`). O fluxo de dados requer que o backend receba, valide, grave de forma abstrata e registre na base de dados os metadados em uma nova tabela `ClinicalAttachment`. 

Para evitar acoplamento do sistema de arquivos físico diretamente no domínio clínico, a persistência física será isolada em um **StorageModule** independente. O frontend consumirá estes registros, permitindo o download, exclusão e visualização de previews de imagem (com suporte a WEBP), além de integrar o upload no próprio formulário de registros clínicos (`ClinicalRecord`).

---

## 1. Banco de Dados (Prisma Schema)

O modelo `ClinicalAttachment` permanece definido no `backend/prisma/schema.prisma` da seguinte forma:

```prisma
model ClinicalAttachment {
  id               String          @id @default(uuid())
  clinicId         String
  petId            String
  clinicalRecordId String?
  originalFileName String
  storedFileName   String
  mimeType         String
  fileSize         BigInt
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

---

## 2. Validações e Middleware (Multer no NestJS)

O upload de arquivos será processado via `multipart/form-data`. O NestJS possui integração nativa com o **Multer** através de interceptors como `@UseInterceptors(FileInterceptor('file'))`.

### Regras de Validação Rígidas:
1. **Limite de Tamanho**: 10 MB (10.485.760 bytes). Arquivos maiores devem lançar imediatamente `PayloadTooLargeException` (HTTP 413).
2. **Tipos de Arquivos Permitidos**: Apenas `application/pdf`, `image/jpeg`, `image/png`, e `image/webp` (adicionado conforme decisão original). Outros formatos devem lançar `BadRequestException` (HTTP 400).
3. **Validação Físicas (MIME-Type)**: A validação será feita via `fileFilter` do Multer no backend para impedir extensões mascaradas.

Exemplo de implementação do interceptor com filtro no controller:
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new BadRequestException('Formato de arquivo inválido. Apenas PDF, JPEG, PNG e WEBP são permitidos.'), false);
    }
    callback(null, true);
  }
}))
```

---

## 3. Isolamento de Tenant e Módulo de Armazenamento Abstrato (StorageModule)

Para evitar acoplamento com o sistema de arquivos local (`fs`), criaremos um módulo de storage independente:
- `backend/src/storage/storage.module.ts`
- `backend/src/storage/storage.service.ts`
- `backend/src/storage/local-storage.service.ts`

### Interface/Classe Abstrata `StorageService`:
Como o NestJS resolve injeções usando classes como tokens, criaremos uma classe abstrata:

```typescript
import { Readable } from 'stream';

export abstract class StorageService {
  abstract save(key: string, buffer: Buffer): Promise<string>;
  abstract delete(key: string): Promise<void>;
  abstract getFileStream(key: string): Promise<Readable>;
  abstract exists(key: string): Promise<boolean>;
}
```

### Implementação Local `LocalStorageService`:
- Responsável por ler do ambiente o caminho raiz de gravação (ex: `./uploads` ou configurado por variáveis de ambiente).
- Organizar as subpastas físicas de gravação de forma hierárquica por clínica e pet: `uploads/clinics/:clinicId/pets/:petId/:storedFileName` (D-04).
- O nome físico do arquivo será um UUID randômico para evitar colisões e proteger caminhos originais.
- Implementar as operações usando `fs.promises` e streams nativas do Node.js.

### Configuração do Módulo:
No `StorageModule`, vincularemos a classe abstrata `StorageService` à implementação concreta `LocalStorageService` usando providers customizados:
```typescript
@Module({
  providers: [
    {
      provide: StorageService,
      useClass: LocalStorageService,
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
```

O `ClinicalAttachmentsService` injetará o token `StorageService` de forma transparente, permitindo chavear futuramente para um `S3StorageService` ou `R2StorageService` apenas alterando a classe no provider do módulo de storage.

---

## Validation Architecture (Arquitetura de Validação Nyquist)

Para seguir a conformidade de Nyquist e garantir que não haja regressões ou furos de segurança, implementaremos os seguintes testes automatizados de backend usando **Jest**:

1. **Testes do StorageService (`storage.service.spec.ts` / `local-storage.service.spec.ts`)**:
   - Garantir que `save` cria pastas corretas e grava arquivos.
   - Garantir que `getFileStream` lê arquivos gravados.
   - Garantir que `exists` retorna true/false corretamente.
   - Garantir que `delete` exclui o arquivo do disco físico.

2. **Testes do ClinicalAttachmentsService & Controller**:
   - Testar que o upload de arquivo válido gera os metadados no banco e chama o `StorageService` com a chave correta.
   - Testar que arquivos com MIME-types proibidos (incluindo tentativas de burlar com extensões modificadas) e arquivos maiores de 10 MB são rejeitados.
   - Testar que o download de um anexo de outra clínica retorna HTTP 404/403 (validação de isolamento de tenant).

---

## ## RESEARCH COMPLETE
