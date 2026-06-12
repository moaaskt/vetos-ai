import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly uploadRootDir = path.resolve(process.cwd(), 'uploads');

  async save(key: string, buffer: Buffer): Promise<string> {
    const fullPath = path.join(this.uploadRootDir, key);
    const dir = path.dirname(fullPath);

    // Garante que o diretório de destino exista
    await fs.promises.mkdir(dir, { recursive: true });

    // Salva o arquivo no disco
    await fs.promises.writeFile(fullPath, buffer);

    return key;
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.uploadRootDir, key);

    if (await this.exists(key)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async getFileStream(key: string): Promise<Readable> {
    const fullPath = path.join(this.uploadRootDir, key);

    if (!(await this.exists(key))) {
      throw new NotFoundException('Arquivo não encontrado no servidor físico.');
    }

    return fs.createReadStream(fullPath);
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = path.join(this.uploadRootDir, key);
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
