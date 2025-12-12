
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JwksService } from '@infrastructure';
import { IJwksService, JwksResponse } from '@interfaces';
vi.mock('crypto', () => ({
	constants: {
		RSA_PKCS1_OAEP_PADDING: 4,
		RSA_X931_PADDING: 5
	},
	generateKeyPairSync: vi.fn(),
	createPublicKey: vi.fn(),
}));
import * as crypto from 'crypto';

const mockPem = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...\n-----END PUBLIC KEY-----';
const mockPublicKeyJWK = {
	kty: 'RSA',
	kid: 'test-key-id-123',
	use: 'sig',
	alg: 'RS256',
	n: 'mock-modulus-value-base64url',
	e: 'AQAB'
};

describe('JwksService', () => {
  let jwksService: IJwksService;

  beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(JwksService.prototype as any, 'validatePublicKey').mockImplementation(() => {});
	jwksService = new JwksService(mockPem, 'test-key-id-123');
  });

  it('should return JWKS with generated RSA key', async () => {
	vi.mocked(crypto.createPublicKey).mockReturnValue({
	  export: vi.fn((opts) => opts?.format === 'jwk' ? mockPublicKeyJWK : undefined)
	} as any);
	vi.mocked(crypto.generateKeyPairSync).mockReturnValue({ publicKey: {}, privateKey: {} } as any);
	const result = await jwksService.getJwks();
	expect(result).toEqual({ keys: [mockPublicKeyJWK] });
  });

  it('should generate unique key ID for each call', async () => {
	vi.mocked(crypto.generateKeyPairSync).mockReturnValue({ publicKey: {}, privateKey: {} } as any);
	vi.mocked(crypto.createPublicKey).mockReturnValue({
	  export: vi.fn((opts) => opts?.format === 'jwk' ? { ...mockPublicKeyJWK, kid: 'test-key-id-123' } : undefined)
	} as any);
	const jwksService1 = new JwksService(mockPem, 'test-key-id-123');
	const firstCall = await jwksService1.getJwks();
	vi.mocked(crypto.createPublicKey).mockReturnValue({
	  export: vi.fn((opts) => opts?.format === 'jwk' ? { ...mockPublicKeyJWK, kid: 'test-key-id-456' } : undefined)
	} as any);
	const jwksService2 = new JwksService(mockPem, 'test-key-id-456');
	const secondCall = await jwksService2.getJwks();
	expect(firstCall.keys[0].kid).toBe('test-key-id-123');
	expect(secondCall.keys[0].kid).toBe('test-key-id-456');
  });

  it('should always use RSA key type', async () => {
	vi.mocked(crypto.createPublicKey).mockReturnValue({
	  export: vi.fn((opts) => opts?.format === 'jwk' ? mockPublicKeyJWK : undefined)
	} as any);
	vi.mocked(crypto.generateKeyPairSync).mockReturnValue({ publicKey: {}, privateKey: {} } as any);
	const result = await jwksService.getJwks();
	expect(result.keys[0].kty).toBe('RSA');
  });

  it('should always use signature purpose', async () => {
	vi.mocked(crypto.createPublicKey).mockReturnValue({
	  export: vi.fn((opts) => opts?.format === 'jwk' ? mockPublicKeyJWK : undefined)
	} as any);
	vi.mocked(crypto.generateKeyPairSync).mockReturnValue({ publicKey: {}, privateKey: {} } as any);
	const result = await jwksService.getJwks();
	expect(result.keys[0].use).toBe('sig');
  });

  it('should always use RS256 algorithm', async () => {
	vi.mocked(crypto.createPublicKey).mockReturnValue({
	  export: vi.fn((opts) => opts?.format === 'jwk' ? mockPublicKeyJWK : undefined)
	} as any);
	vi.mocked(crypto.generateKeyPairSync).mockReturnValue({ publicKey: {}, privateKey: {} } as any);
	const result = await jwksService.getJwks();
	expect(result.keys[0].alg).toBe('RS256');
  });

  it('should return array with single key', async () => {
	vi.mocked(crypto.createPublicKey).mockReturnValue({
	  export: vi.fn((opts) => opts?.format === 'jwk' ? mockPublicKeyJWK : undefined)
	} as any);
	vi.mocked(crypto.generateKeyPairSync).mockReturnValue({ publicKey: {}, privateKey: {} } as any);
	const result = await jwksService.getJwks();
	expect(Array.isArray(result.keys)).toBe(true);
	expect(result.keys).toHaveLength(1);
  });

	// Puedes agregar más tests aquí siguiendo la misma estructura
});
