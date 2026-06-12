import { Readable } from 'stream';

export abstract class StorageService {
  abstract save(key: string, buffer: Buffer): Promise<string>;
  abstract delete(key: string): Promise<void>;
  abstract getFileStream(key: string): Promise<Readable>;
  abstract exists(key: string): Promise<boolean>;
}
