import { JwtService } from '@/infrastructure';
import { IKeyProvider, ILogger, IJwtPayload } from '@/interfaces';
import { InvalidTokenError } from '@/shared';

describe('JwtService', () => {
  let mockKeyProvider: jest.Mocked<IKeyProvider>;
  let mockLogger: jest.Mocked<ILogger>;
  let jwtService: JwtService;

  const validPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDdUjqH/+D4z38y
EVRxkfX3rzYTWR3sy/9pjMBDJ4vutsbBoQK39TFxA8kMtKiv9gxOk20uVKLoNFk1
q4spmKfkp55WHVQv05KBjA1bWUKfRnUeSpH2K51inoDkPxmfpRzD7PwsQVkbhHAB
zJhOnFCLxCucZ2IRWqyk7P3PTzpjCU7w6MInTYy/IroxVnX7ijFTbnRXq9DoF6ey
BSDxHqK26Uiadf+HpF+cypAfSrvOuC5jXG+B7SPjdEifGEKESviKLma/l1NAVwJ3
zha7fBEt2i0kcYNCinU3hEgYdHqJPEfrDzalwEtArhSRtFI0Jto4/oEn9FaEBJr7
YWTE5UlnAgMBAAECggEABApbIjJsmuDEkXWdD2LhwM8eqtiMQhLIfieEh/2+mRAW
YCP+fmwLfeTu+zJSSwHEYFRvyotmA4voDtCyajIswn6YySu72TlA0nyvP4eaI5Sf
KJZVItY9Xt8/pnUxZUXNvgeE/yWFG5e8FLD1o9BIX6Hk2ghOFqHO2zlQEaKiGBz+
WdoATVjjciz6AWdKumfcj6ryLRmrEebcb6OvVMdET1pvqGjTpIHZJ/WQNjP5Nu1F
bFgMoYsYdrrPZPY4Z5BwbPZlucT0e4DphKaWewF6d+q45yhwoJ7Beitmta9fiPZn
U5pith/AmV182SlmnbxjNPoo+2tAFkmjtJoVNvPkIQKBgQD3STBraVRUE7cjnVB0
JO3jgkhHcDfcnbjr4t+grnb1kg7cqT8buqHwyGAiYEvbmvx/eMkT6S7OOI8reBGC
Yj9vON054ZkaaA5KmFl4Bseo4Dl/jIRaPRIa1pXaRo+LfWshmrrzAIIS2ErUlyTX
BmIUL0MxCgkUrzP+r5Gw28l3IQKBgQDlHs6tPskpmXDrzsXFp4v81eZfnZgw2zTg
OQug67IooLW35OF+pC12LIjMRJ4eVfFWKEtEggDWXdYjRtrPFtWALXKtV1Afgooq
OBJJD0n+HRhf8BjyCqQ+/uBJuEplpDVQeZ5nbTJ3Y+SJMOTmxOmx8Vy/k5/Jm42F
q8aTQwOXhwKBgQDUEBXP5zIEMCwcBKqcD5daRb3KVbfyH+gXkiYI29T0X18TaKjQ
FMsPfCbFFCO5nj3u6xw1UQFspCBTPNJ3J94SeYduPcNYW+f1nJUNU3MhpbhpY42U
/U5raZ5045HyI4od9V1hSwxBMO9rRHq5U6YEfUt34I1NCbrjLJkaPEGXQQKBgFG3
cSMc94YcsceIkcTzAtyENYv4myUhqXQnJFyac4pF90nFGh+e0pAJRikEeBh9snt2
F5Ixg7bw9MTUKoodrLvweawVLgBvAHQaV3szNsKpAd6FtX/uB7JoGPpx/ibOMC2p
krN0oMEwIXxEsf8UT/0lBl1Ve3HeRtVb9JDlH8zVAoGBAJApeB4lrtk8AcYx12TP
c7NiHxSZGTsiJHslrVLqMgrKrG9UDx65H0F9CABZc7mT+tLbrOmpTCuUYlZVoNo8
3sChHd8HwsQcrv5+MQn0Tg+Et6KzOeXZHhuUkd6/sCgT8gS1uEBzWSPCmLJ1nYou
/KazhryRdOFhp3/k7tIXaXw0
-----END PRIVATE KEY-----`;

  const validPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3VI6h//g+M9/MhFUcZH1
9682E1kd7Mv/aYzAQyeL7rbGwaECt/UxcQPJDLSor/YMTpNtLlSi6DRZNauLKZin
5KeeVh1UL9OSgYwNW1lCn0Z1HkqR9iudYp6A5D8Zn6Ucw+z8LEFZG4RwAcyYTpxQ
i8QrnGdiEVqspOz9z086YwlO8OjCJ02MvyK6MVZ1+4oxU250V6vQ6BensgUg8R6i
tulImnX/h6RfnMqQH0q7zrguY1xvge0j43RInxhChEr4ii5mv5dTQFcCd84Wu3wR
LdotJHGDQop1N4RIGHR6iTxH6w82pcBLQK4UkbRSNCbaOP6BJ/RWhASa+2FkxOVJ
ZwIDAQAB
-----END PUBLIC KEY-----
`;

  const keyId = 'test-key-1';
  const serviceName = 'test-service';
  const tokenExpiresIn = 900;
  const jwtAudience: string | string[] | undefined = [];

  beforeEach(() => {
    mockKeyProvider = {
      getPrivateKey: jest.fn().mockReturnValue(validPrivateKey),
      getPublicKey: jest.fn().mockReturnValue(validPublicKey),
      getKeyId: jest.fn().mockReturnValue(keyId),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    jwtService = new JwtService(serviceName, tokenExpiresIn, jwtAudience, mockKeyProvider, mockLogger);
  });

  describe('generateAccessToken', () => {
    it('should generate valid JWT token with required claims', () => {
      // Arrange
      const payload = { sub: 'user123', client_id: 'client123' };

      // Act
      const token = jwtService.generateAccessToken(payload);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      expect(mockLogger.debug).toHaveBeenCalledWith('Generating JWT access token', {
        sub: 'user123',
        expiresIn: 900,
      });
    });

    it('should include optional scope in token', () => {
      // Arrange
      const payload = { sub: 'user123', scope: 'read write', client_id: 'client123' };

      // Act
      const token = jwtService.generateAccessToken(payload);
      const decoded = jwtService.decodeToken(token);

      // Assert
      expect(decoded).toMatchObject({
        sub: 'user123',
        scope: 'read write',
        client_id: 'client123',
        iss: serviceName,
      });
    });

    it('should use custom expiration when provided', () => {
      // Arrange
      const payload = { sub: 'user123' };

      // Act
      const token = jwtService.generateAccessToken(payload);
      const decoded = jwtService.decodeToken(token) as IJwtPayload;

      // Assert
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token and return payload', () => {
      // Arrange
      const payload = { sub: 'user123', client_id: 'client123' };
      const token = jwtService.generateAccessToken(payload);

      // Act
      const verified = jwtService.verifyToken(token);

      // Assert
      expect(verified).toMatchObject({
        sub: 'user123',
        client_id: 'client123',
        iss: serviceName,
      });
      expect(verified.iat).toBeDefined();
      expect(verified.exp).toBeDefined();
    });

    it('should throw InvalidTokenError for malformed token', () => {
      // Arrange
      const invalidToken = 'invalid.token.format';

      // Act & Assert
      expect(() => jwtService.verifyToken(invalidToken)).toThrow(InvalidTokenError);
      expect(() => jwtService.verifyToken(invalidToken)).toThrow('Invalid token signature or format');
    });

    it('should throw InvalidTokenError for token with wrong issuer', () => {
      // Arrange
      const wrongIssuerService = new JwtService('wrong-issuer', 900, [], mockKeyProvider, mockLogger);
      const token = wrongIssuerService.generateAccessToken({ sub: 'user123' });

      // Act & Assert
      expect(() => jwtService.verifyToken(token)).toThrow(InvalidTokenError);
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      // Arrange
      const payload = { sub: 'user123', client_id: 'client123' };
      const token = jwtService.generateAccessToken(payload);

      // Act
      const decoded = jwtService.decodeToken(token);

      // Assert
      expect(decoded).toMatchObject({
        sub: 'user123',
        client_id: 'client123',
        iss: serviceName,
      });
    });

    it('should return null for invalid token format', () => {
      // Arrange
      const invalidToken = 'not.a.jwt';

      // Act
      const decoded = jwtService.decodeToken(invalidToken);

      // Assert
      expect(decoded).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith('JWT token decoding failed', expect.any(Object));
    });
  });
});
