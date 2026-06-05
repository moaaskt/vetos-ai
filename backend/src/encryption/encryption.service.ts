import { Injectable, Logger } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;

  constructor() {
    this.key = this.resolveKey();
  }

  encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      'v1',
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':');
  }

  decrypt(encryptedText: string): string {
    const [version, ivValue, authTagValue, encryptedValue] =
      encryptedText.split(':');

    if (
      version !== 'v1' ||
      ivValue === undefined ||
      authTagValue === undefined ||
      encryptedValue === undefined
    ) {
      throw new Error('Invalid encrypted payload format');
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      this.key,
      Buffer.from(ivValue, 'base64url'),
      { authTagLength: AUTH_TAG_LENGTH },
    );
    decipher.setAuthTag(Buffer.from(authTagValue, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private resolveKey(): Buffer {
    const configuredKey = process.env.ENCRYPTION_KEY;

    if (!configuredKey) {
      this.logger.warn(
        'ENCRYPTION_KEY is not set. Using an ephemeral local development key.',
      );
      return randomBytes(32);
    }

    const decodedKey = this.decodeConfiguredKey(configuredKey);

    if (decodedKey.length === 32) {
      return decodedKey;
    }

    return createHash('sha256').update(configuredKey).digest();
  }

  private decodeConfiguredKey(configuredKey: string): Buffer {
    if (/^[a-f0-9]{64}$/i.test(configuredKey)) {
      return Buffer.from(configuredKey, 'hex');
    }

    try {
      return Buffer.from(configuredKey, 'base64');
    } catch {
      return Buffer.from(configuredKey, 'utf8');
    }
  }
}
