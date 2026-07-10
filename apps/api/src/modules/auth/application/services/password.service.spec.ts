import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes a password to an argon2id digest', async () => {
    const hash = await service.hash('correct-horse-battery-staple');
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('produces different hashes for the same password (random salt)', async () => {
    const [a, b] = await Promise.all([
      service.hash('same-password'),
      service.hash('same-password'),
    ]);
    expect(a).not.toEqual(b);
  });

  it('verifies a correct password', async () => {
    const hash = await service.hash('s3cret-value');
    await expect(service.verify(hash, 's3cret-value')).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await service.hash('s3cret-value');
    await expect(service.verify(hash, 'wrong-value')).resolves.toBe(false);
  });

  it('returns false (never throws) for a malformed hash', async () => {
    await expect(service.verify('not-a-real-hash', 'whatever')).resolves.toBe(false);
  });
});
