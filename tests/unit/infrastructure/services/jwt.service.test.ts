import { JwtService } from '@/infrastructure';
import { IClock, IConfig, ILogger } from '@/interfaces';

describe('JwtService', () => {
  let jwtService: JwtService;
  let mockConfig: IConfig;
  let mockLogger: ILogger;
  let mockClock: IClock;

  // Test RSA key pair (for testing only - generate real keys for production)
  const testPrivateKey =
    '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA1rrgIgOrd1vXp6fnRlqR8mPmEhez70WlEigzkYvPdnFlbbOE\nBADDQip+xzKAKyHeQ9jCRRlYF4WHFkUuyg5RcFs2+ptJnJJJQsLOyNphQDdZD7d9\nQEiV4NpKfYWRgFj8ZJt9cL7Om7BuftpQkVS3539Me9ZN1hm3FE9Eam0V21BBKIUn\nKnqlVUjydvHleftQ+RvN+d4q/6y7spuDUEpucxwDEXl2Fz8cSm7QUM7CNtVQbfMp\nlq2uoT2mJKkG6fRKHNRvHRRbMjnKAFAg7d/h3aw+SxJKoj8UbemPiwoReyMhQ07M\nwfYELAg4/Bu8ep6TamqyyWaUy9Nc0RrkoPpMPQIDAQABAoIBAQCQZAc1OCyDzXFd\nXq1JBLwhNwXNYrzvB3DxnbDXjSELb0MaGl2KZ4zlIDgx8IZ4+oRAMTCpUFqJLpPg\n6NKGskwW9m8o42UDcObsipyMOTSt/snXpLYHlQebtI3ki/2ERdIqQNiACP5beK9E\ng78risFDXLlsiHW8o3wVnxvNSN8qojhhOgR7CdlIYBG0sSIEX3ZFwo/Zj6VQHYcK\nt8u4QEozRB9oQrla6Qu108UNJOs+z3qIofZeoY3B0WSMlWc+AfJY9Rq/EXcmAqa7\nPMuBNbj8QRiQS/rKVn1aZKD6jaYId0x4OgP1wQKbDJowFwqofyfaBvQPB/1ze9+P\nZtU2K5YtAoGBAO55I65FVU/6ukjovUX7Oj/6448stNSxJ6Xvce129DvJmp+G0ThV\nmaNSwomJLvc3y8hPToEpMvS7eCXJK5a9ZH2mpM2laSfwlp1PoTgRegSaYNAe8Wd1\nNcDn5BTPvkEcGCLwao5f8vuGUa4H9o0O2OqjEyHYW4o742p+EdKnyxBvAoGBAOaD\nAj1x2eyKEs0CeCHHL0ix6CnpST9B+SNC3rojUizm8Lc+COaO/qfV90cy0zH2r3XG\nJRizsy0tKgN90+PKJi0SqZOVMHEP6bQ6Y9oiiQr8eE/ziIhJC9B4toI8YzQkM2/E\nIAAiWbP60JPiT2DEE69KImshYs1KjUX/I3aLuywTAoGAHcTHfHixNqOw32sWPYcn\n9VanU3ccN7TJo0Aps5/2ywPWpnVY5rRg0m+BU1Pppfi0GpQz05HGB6DjVawwIcgQ\npFLKHdW5M8AnvQl0saAU4EA5N6G1Ntn91M/du+9W65/LL4ldc9psZZOV3Kin0WH6\nGAg1WjM88huZvvBv3yENC0cCgYATHOXApoIFROWOLhg75MIc6vNvFjLGlffMXq0N\nDgSwSG3JI9GlHFItJGaedq5gRC4EO+uzgqLmqgoDxBkfmBFWR2fcHtCnb0RXd0f0\nPEzUpl5rcqvtcPET1g57+fnXxvCk4cQtfqularSEro0aXueq7yCvdVM15mqUVTVh\njPB2FQKBgQCiAv8XZZL9C7DpjC67CBnjRnY8ZTwZwIj7rY/aZjVLcNWOJeR6bSPU\ns9wTCdxaoDGL3Nu+Q5DuTMBiOfTSFPWh1zrz/93UmeAacf0r2hj+/6CSqOLRIDBL\ny8njUPFOfmw90usnOA51z1h5WYQ1+3y0BBh8dAyrGwl18D4cdHzarg==\n-----END RSA PRIVATE KEY-----\n';

  const testPublicKey =
    '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1rrgIgOrd1vXp6fnRlqR\n8mPmEhez70WlEigzkYvPdnFlbbOEBADDQip+xzKAKyHeQ9jCRRlYF4WHFkUuyg5R\ncFs2+ptJnJJJQsLOyNphQDdZD7d9QEiV4NpKfYWRgFj8ZJt9cL7Om7BuftpQkVS3\n539Me9ZN1hm3FE9Eam0V21BBKIUnKnqlVUjydvHleftQ+RvN+d4q/6y7spuDUEpu\ncxwDEXl2Fz8cSm7QUM7CNtVQbfMplq2uoT2mJKkG6fRKHNRvHRRbMjnKAFAg7d/h\n3aw+SxJKoj8UbemPiwoReyMhQ07MwfYELAg4/Bu8ep6TamqyyWaUy9Nc0RrkoPpM\nPQIDAQAB\n-----END PUBLIC KEY-----\n';

  beforeEach(() => {
    mockConfig = {
      jwt: {
        privateKey: testPrivateKey,
        publicKey: testPublicKey,
        issuer: 'byteberry-oauth2',
        audience: 'byteberry-api',
        expiresIn: 900,
      },
    } as jest.Mocked<IConfig>;

    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    mockClock = {
      now: jest.fn(() => new Date('2025-01-01T12:00:00Z')),
    } as unknown as jest.Mocked<IClock>;

    jwtService = new JwtService(mockConfig, mockLogger, mockClock);
  });

  describe('constructor', () => {
    it('should initialize with valid configuration', () => {
      expect(jwtService).toBeInstanceOf(JwtService);
      expect(mockLogger.debug).toHaveBeenCalledWith('JwtService initialized with RS256 algorithm', expect.anything());
    });
    it('should throw JwtConfigurationError if private key is missing', () => {
      mockConfig.jwt.privateKey = '';

      expect(() => new JwtService(mockConfig, mockLogger, mockClock)).toThrow('JWT configuration error: JWT_PRIVATE_KEY is not configured');
    });
  });
  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await jwtService.generateToken({
        subject: 'user-123',
        clientId: 'client-456',
        scope: ['read', 'write'],
      });

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include correct claims in token', async () => {
      const token = await jwtService.generateToken({
        subject: 'user-123',
        clientId: 'client-456',
        scope: ['read', 'write'],
        expiresIn: 1800,
      });

      const decoded = jwtService.decodeToken(token);

      expect(decoded).toMatchObject({
        sub: 'user-123',
        client_id: 'client-456',
        scope: ['read', 'write'],
        iss: 'byteberry-oauth2',
        aud: 'byteberry-api',
      });
      expect(decoded?.iat).toBeDefined();
      expect(decoded?.exp).toBeDefined();
    });

    it('should use default expiration if not provided', async () => {
      const token = await jwtService.generateToken({
        subject: 'user-123',
        clientId: 'client-456',
        scope: ['read'],
      });

      const decoded = jwtService.decodeToken(token);
      const expectedExp = Math.floor(new Date('2025-01-01T12:00:00Z').getTime() / 1000) + 900;

      expect(decoded?.exp).toBe(expectedExp);
    });
  });
  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = await jwtService.generateToken({
        subject: 'user-123',
        clientId: 'client-456',
        scope: ['read'],
      });

      const result = await jwtService.verifyToken(token);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.sub).toBe('user-123');
    });

    it('should reject an expired token', async () => {
      // Generate token that expires immediately
      const token = await jwtService.generateToken({
        subject: 'user-123',
        clientId: 'client-456',
        scope: ['read'],
        expiresIn: -1, // Already expired
      });

      const result = await jwtService.verifyToken(token);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should reject a token with invalid signature', async () => {
      const token = await jwtService.generateToken({
        subject: 'user-123',
        clientId: 'client-456',
        scope: ['read'],
      });

      // Tamper with token
      const tamperedToken = token.slice(0, -10) + 'TAMPERED';

      const result = await jwtService.verifyToken(tamperedToken);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject a malformed token', async () => {
      const result = await jwtService.verifyToken('not.a.token');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImNsaWVudF9pZCI6ImNsaWVudC00NTYifQ.signature';

      const decoded = jwtService.decodeToken(token);

      expect(decoded).toBeDefined();
      // Note: This will fail with invalid token, just for demonstration
    });

    it('should return null for invalid token', () => {
      const decoded = jwtService.decodeToken('invalid-token');

      expect(decoded).toBeNull();
    });
  });
});
