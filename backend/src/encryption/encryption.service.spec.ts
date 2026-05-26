import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  const originalEncryptionKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key';
  });

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalEncryptionKey;
  });

  it('encrypts and decrypts a string', () => {
    const service = new EncryptionService();

    const encrypted = service.encrypt('smtp-secret');

    expect(encrypted).not.toBe('smtp-secret');
    expect(service.decrypt(encrypted)).toBe('smtp-secret');
  });
});
