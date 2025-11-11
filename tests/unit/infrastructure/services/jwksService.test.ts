import { JwksService } from '@/infrastructure';

describe('JwksService', () => {
  const validPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyeh
kd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ
0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdg
cKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbc
mwIDAQAB
-----END PUBLIC KEY-----`;

  const keyId = 'test-key-1';

  describe('constructor', () => {
    it('should create instance with valid public key', () => {
      // Arrange & Act
      const service = new JwksService(validPublicKey, keyId);

      // Assert
      expect(service).toBeInstanceOf(JwksService);
    });

    it('should throw error if public key is empty', () => {
      // Arrange & Act & Assert
      expect(() => new JwksService('', keyId)).toThrow('Public key is required');
    });

    it('should throw error if public key format is invalid', () => {
      // Arrange & Act & Assert
      expect(() => new JwksService('invalid-key', keyId)).toThrow('Invalid public key format - must be PEM encoded');
    });
  });

  describe('getJwks', () => {
    it('should return valid JWKS structure', async () => {
      // Arrange
      const service = new JwksService(validPublicKey, keyId);

      // Act
      const jwks = await service.getJwks();

      // Assert
      expect(jwks).toHaveProperty('keys');
      expect(Array.isArray(jwks.keys)).toBe(true);
      expect(jwks.keys).toHaveLength(1);
    });

    it('should return JWK with correct structure and components', async () => {
      // Arrange
      const service = new JwksService(validPublicKey, keyId);

      // Act
      const jwks = await service.getJwks();
      const jwk = jwks.keys[0];

      // Assert
      expect(jwk).toHaveProperty('kty', 'RSA');
      expect(jwk).toHaveProperty('kid', keyId);
      expect(jwk).toHaveProperty('use', 'sig');
      expect(jwk).toHaveProperty('alg', 'RS256');
      expect(jwk).toHaveProperty('n');
      expect(jwk).toHaveProperty('e');
      expect(typeof jwk.n).toBe('string');
      expect(typeof jwk.e).toBe('string');
      expect(jwk.n.length).toBeGreaterThan(0);
      expect(jwk.e).toBe('AQAB');
    });

    it('should cache JWKS result on subsequent calls', async () => {
      // Arrange
      const service = new JwksService(validPublicKey, keyId);

      // Act
      const jwks1 = await service.getJwks();
      const jwks2 = await service.getJwks();

      // Assert
      expect(jwks1).toBe(jwks2); // Same reference = cached
    });
  });
});
