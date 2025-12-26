
import { JwksService } from '@infrastructure';
import { vi } from 'vitest';

// Subclase mock para evitar validar la llave
class MockJwksService extends JwksService {
	// Sobrescribe el método privado para que no haga nada
	// @ts-ignore
	protected validatePublicKey(): void {}
}

describe('JwksService', () => {
	const validPublicKey = 'dummy-key';
	const keyId = 'test-key-id';

	it('should create JwksService with valid parameters', () => {
		expect(() => new MockJwksService(validPublicKey, keyId)).not.toThrow();
	});

	it('should throw error for empty public key', () => {
		expect(() => new JwksService('', keyId)).toThrow('Public key is required');
	});

	it('should throw error for non-PEM public key', () => {
		expect(() => new JwksService('not-a-pem-key', keyId)).toThrow('Invalid public key format');
	});

	it('should return JWKS with correct structure', async () => {
		const service = new MockJwksService(validPublicKey, keyId);
		const fakeJwk = { kty: 'RSA' as const, kid: keyId, use: 'sig' as const, alg: 'RS256' as const, n: 'n', e: 'e' };
		vi.spyOn(service, 'convertPemToJwk').mockReturnValue(fakeJwk);
		const jwks = await service.getJwks();

		expect(jwks).toHaveProperty('keys');
		expect(Array.isArray(jwks.keys)).toBe(true);
		expect(jwks.keys.length).toBeGreaterThan(0);
		expect(jwks.keys[0]).toEqual(fakeJwk);
	});

	it('should cache JWKS response', async () => {
		const service = new MockJwksService(validPublicKey, keyId);
		const fakeJwk = { kty: 'RSA' as const, kid: keyId, use: 'sig' as const, alg: 'RS256' as const, n: 'n', e: 'e' };
		vi.spyOn(service, 'convertPemToJwk').mockReturnValue(fakeJwk);

		const jwks1 = await service.getJwks();
		const jwks2 = await service.getJwks();

		expect(jwks1).toBe(jwks2); // Same reference = cached
	});
});
