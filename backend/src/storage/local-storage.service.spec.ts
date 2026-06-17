import { Test, TestingModule } from '@nestjs/testing';
import { LocalStorageService } from './local-storage.service';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

describe('LocalStorageService', () => {
  let service: StorageService;
  const testKey = 'test/integration-test.txt';
  const testContent = Buffer.from('VetosAI Storage Test Content');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: StorageService,
          useClass: LocalStorageService,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(async () => {
    // Garante limpeza do arquivo de teste se ele sobrou
    try {
      await service.delete(testKey);
    } catch {}
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save, verify existence, read, and delete file successfully', async () => {
    // 1. Salvar
    const savedKey = await service.save(testKey, testContent);
    expect(savedKey).toBe(testKey);

    // 2. Verificar existência
    const exists = await service.exists(testKey);
    expect(exists).toBe(true);

    // 3. Ler stream
    const stream = await service.getFileStream(testKey);
    expect(stream).toBeInstanceOf(Readable);

    // Bufferizar o stream para checar o conteúdo
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const finalBuffer = Buffer.concat(chunks);
    expect(finalBuffer.toString()).toBe('VetosAI Storage Test Content');

    // 4. Deletar
    await service.delete(testKey);

    // 5. Verificar que não existe mais
    const existsAfterDelete = await service.exists(testKey);
    expect(existsAfterDelete).toBe(false);
  });

  it('should throw NotFoundException if trying to read non-existent file', async () => {
    await expect(service.getFileStream('test/does-not-exist.txt')).rejects.toThrow();
  });
});
