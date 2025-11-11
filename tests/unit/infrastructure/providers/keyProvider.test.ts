import { existsSync, readFileSync } from 'fs';
import { EnvKeyProvider } from '@/infrastructure';
import { ConfigError } from '@/shared';

// Mock del módulo fs
jest.mock('fs');

const mockedExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockedReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

describe('EnvKeyProvider', () => {
  const validPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu
-----END PRIVATE KEY-----`;

  const validPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
-----END PUBLIC KEY-----`;

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor with environment variables', () => {
    it('should create instance with valid keys from environment', () => {
      // Arrange
      process.env.JWT_PRIVATE_KEY = validPrivateKey;
      process.env.JWT_PUBLIC_KEY = validPublicKey;
      process.env.JWT_KEY_ID = 'test-key-1';

      // Act
      const provider = new EnvKeyProvider();

      // Assert
      expect(provider.getPrivateKey()).toBe(validPrivateKey);
      expect(provider.getPublicKey()).toBe(validPublicKey);
      expect(provider.getKeyId()).toBe('test-key-1');
    });

    it('should use default key ID when not provided', () => {
      // Arrange
      process.env.JWT_PRIVATE_KEY = validPrivateKey;
      process.env.JWT_PUBLIC_KEY = validPublicKey;
      delete process.env.JWT_KEY_ID;

      // Act
      const provider = new EnvKeyProvider();

      // Assert
      expect(provider.getKeyId()).toBe('default-key-1');
    });

    it('should handle escaped newlines in environment variables', () => {
      // Arrange
      const keyWithEscapedNewlines = validPrivateKey.replace(/\n/g, '\\n');
      process.env.JWT_PRIVATE_KEY = keyWithEscapedNewlines;
      process.env.JWT_PUBLIC_KEY = validPublicKey;

      // Act
      const provider = new EnvKeyProvider();

      // Assert
      expect(provider.getPrivateKey()).toBe(validPrivateKey);
    });

    it('should throw error if environment keys are invalid', () => {
      // Arrange
      process.env.JWT_PRIVATE_KEY = 'invalid-key';
      process.env.JWT_PUBLIC_KEY = validPublicKey;

      // Act & Assert
      expect(() => new EnvKeyProvider()).toThrow(ConfigError);
      expect(() => new EnvKeyProvider()).toThrow('must contain PEM header');
    });
  });

  describe('constructor with file system keys', () => {
    it('should load keys from files when environment variables not set', () => {
      // Arrange
      delete process.env.JWT_PRIVATE_KEY;
      delete process.env.JWT_PUBLIC_KEY;

      mockedExistsSync.mockReturnValue(true);
      mockedReadFileSync.mockReturnValueOnce(validPrivateKey as any).mockReturnValueOnce(validPublicKey as any);

      // Act
      const provider = new EnvKeyProvider();

      // Assert
      expect(provider.getPrivateKey()).toBe(validPrivateKey);
      expect(provider.getPublicKey()).toBe(validPublicKey);
      expect(mockedReadFileSync).toHaveBeenCalledTimes(2);
    });

    it('should throw ConfigError when key files do not exist', () => {
      // Arrange
      delete process.env.JWT_PRIVATE_KEY;
      delete process.env.JWT_PUBLIC_KEY;

      mockedExistsSync.mockReturnValue(false);

      // Act & Assert
      expect(() => new EnvKeyProvider()).toThrow(ConfigError);
      expect(() => new EnvKeyProvider()).toThrow('JWT keys not found');
    });
  });
});
