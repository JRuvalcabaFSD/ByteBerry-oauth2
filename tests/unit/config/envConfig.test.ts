import type { ConfigError } from '@/shared';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

jest.mock(
  '../../package.json',
  () => ({
    version: '1.0.0-test',
  }),
  { virtual: true }
);

describe('Config', () => {
  const originaEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {};
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originaEnv;
  });

  describe('Constructor and Environment Loading', () => {
    it('should load default configuration when no environment variables provided', async () => {
      const { Config } = await import('@config');

      const config = Config.getConfig();

      expect(config.nodeEnv).toBe('development');
      expect(config.port).toBe(4000);
      expect(config.logLevel).toBe('info');
      expect(config.serviceName).toBe('ByteBerry-OAuth2');
      expect(config.corsOrigins).toEqual(['http://localhost:5173', 'http://localhost:4002', 'http://localhost:4003']);
      expect(config.version).toEqual('0.0.0');
    });
    it('should load custom configuration when valid environment variables provided', async () => {
      process.env = {
        NODE_ENV: 'production',
        PORT: '8080',
        LOG_LEVEL: 'warn',
        SERVICE_NAME: 'Custom Oauth2',
        CORS_ORIGINS: 'http://example.com',
      };

      const { Config } = await import('@config');
      const config = Config.getConfig();

      expect(config.nodeEnv).toBe('production');
      expect(config.port).toBe(8080);
      expect(config.logLevel).toBe('warn');
      expect(config.serviceName).toBe('Custom Oauth2');
      expect(config.corsOrigins).toEqual(['http://example.com']);
    });
    it('should throw config error when invalid node env provided', async () => {
      process.env.NODE_ENV = 'invalid_env';

      const { Config } = await import('@config');
      const { ConfigError } = await import('@/shared');

      expect(() => Config.getConfig()).toThrow(ConfigError);
    });
    it('should throw config error when invalid log level provided', async () => {
      process.env.LOG_LEVEL = 'invalid_logLevel';

      const { Config } = await import('@config');
      const { ConfigError } = await import('@/shared');

      expect(() => Config.getConfig()).toThrow(ConfigError);
    });
    it('should throw config error when invalid port provided', async () => {
      process.env.PORT = 'not a number';

      const { Config } = await import('@config');
      const { ConfigError } = await import('@/shared');

      expect(() => Config.getConfig()).toThrow(ConfigError);
    });
    it('should include context in error when validation fails', async () => {
      process.env = { PORT: 'invalid port', NODE_ENV: 'invalid env', LOG_LEVEL: 'invalid level' };
      const { Config } = await import('@config');
      const { ConfigError } = await import('@/shared');

      try {
        Config.getConfig();
        fail('Expected ConfigError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigError);
        const configError = error as ConfigError;
        expect(configError.context).toMatchObject({
          providedPort: 'invalid port',
          providedNodeEnv: 'invalid env',
          providedLogLevel: 'invalid level',
        });
        expect(configError.context.originalError).toBeDefined();
      }
    });
  });
  describe('Singleton Pattern', () => {
    it('should return same instance when called multiple times', async () => {
      const { Config } = await import('@config');

      const config1 = Config.getConfig();
      const config2 = Config.getConfig();

      expect(config1).toBe(config2);
      expect(config1).toBeInstanceOf(Config);
    });
    it('should create new instance when reset instance called', async () => {
      const { Config } = await import('@config');

      const config1 = Config.getConfig();
      Config.resetInstance();
      const config2 = Config.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toBeInstanceOf(Config);
    });
    it('should load new environment when instance reset with different env', async () => {
      const { Config } = await import('@config');

      process.env.PORT = '3000';
      const config1 = Config.getConfig();
      expect(config1.port).toBe(3000);

      process.env.PORT = '5000';
      Config.resetInstance();
      const config2 = Config.getConfig();

      expect(config2.port).toBe(5000);
      expect(config1.port).toBe(3000);
    });
  });
  describe('Environment Predicates', () => {
    it('should return true when is development and node env is development', async () => {
      const { Config } = await import('@config');

      process.env.NODE_ENV = 'development';
      const config = Config.getConfig();

      expect(config.isDevelopment()).toBeTruthy();
      expect(config.isProduction()).toBeFalsy();
      expect(config.isTest()).toBeFalsy();
    });
    it('should return true when is production and node env is production', async () => {
      const { Config } = await import('@config');

      process.env.NODE_ENV = 'production';
      const config = Config.getConfig();

      expect(config.isProduction()).toBeTruthy();
      expect(config.isDevelopment()).toBeFalsy();
      expect(config.isTest()).toBeFalsy();
    });
    it('should return true when is test and node env is test', async () => {
      const { Config } = await import('@config');

      process.env.NODE_ENV = 'test';
      const config = Config.getConfig();

      expect(config.isTest()).toBeTruthy();
      expect(config.isDevelopment()).toBeFalsy();
      expect(config.isProduction()).toBeFalsy();
    });
  });
  describe('Summary Generation', () => {
    it('should return correct summary when get summary called', async () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.LOG_LEVEL = 'error';

      const { Config } = await import('@config');
      const config = Config.getConfig();

      // Act
      const summary = config.getSummary();

      // Assert
      expect(summary).toEqual({
        nodeEnv: 'production',
        port: 8080,
        logLevel: 'error',
        serviceName: 'ByteBerry-OAuth2',
        corsOrigins: expect.any(Array),
        version: expect.any(String),
        isDevelopment: false,
        isProduction: true,
        isTest: false,
      });
    });

    it('should return serializable object when get summary called', async () => {
      // Arrange
      const { Config } = await import('@config');
      const config = Config.getConfig();

      // Act
      const summary = config.getSummary();

      // Assert
      expect(() => JSON.stringify(summary)).not.toThrow();
      const serialized = JSON.parse(JSON.stringify(summary));
      expect(serialized).toEqual(summary);
    });
  });

  describe('URL Normalization', () => {
    it('should normalize urls when valid urls provided', async () => {
      // Arrange
      process.env.CORS_ORIGINS = 'HTTPS://Example.COM/path/,HTTP://LOCALHOST:3000/';
      const { Config } = await import('@config');

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.corsOrigins).toEqual(['https://example.com/path', 'http://localhost:3000']);
    });

    it('should remove trailing slashes when urls have trailing slashes', async () => {
      // Arrange
      process.env.CORS_ORIGINS = 'https://example.com/,https://app.example.com/api/';
      const { Config } = await import('@config');

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.corsOrigins).toEqual(['https://example.com', 'https://app.example.com/api']);
    });

    it('should preserve root path when url is root', async () => {
      // Arrange
      process.env.CORS_ORIGINS = 'https://example.com/';
      const { Config } = await import('@config');

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.corsOrigins).toEqual(['https://example.com']);
    });

    it('should preserve invalid urls when invalid urls provided', async () => {
      // Arrange
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.env.CORS_ORIGINS = 'https://valid.com,invalid url,mailto:test@example.com';
      const { Config } = await import('@config');

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.corsOrigins).toEqual(['https://valid.com', 'invalid url', 'mailto:test@example.com']);
      // Comprobar el mensaje del error en lugar del constructor (más fiable)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid URL skipped for normalization: invalid url',
        expect.objectContaining({ message: 'Invalid URL' })
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Type Safety', () => {
    it('should have correct types when config created', async () => {
      // Arrange & Act
      const { Config } = await import('@config');
      const config = Config.getConfig();

      // Assert
      expect(typeof config.nodeEnv).toBe('string');
      expect(typeof config.port).toBe('number');
      expect(typeof config.logLevel).toBe('string');
      expect(typeof config.serviceName).toBe('string');
      expect(Array.isArray(config.corsOrigins)).toBe(true);
      expect(typeof config.version).toBe('string');

      // Type assertions for enums
      expect(['development', 'production', 'test']).toContain(config.nodeEnv);
      expect(['debug', 'info', 'warn', 'error']).toContain(config.logLevel);
    });
  });

  describe('Edge Cases', () => {
    it('should handle port zero when valid port zero provided', async () => {
      // Arrange
      process.env.PORT = '0';
      const { Config } = await import('@config');

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.port).toBe(0);
    });

    it('should handle max port when valid max port provided', async () => {
      // Arrange
      process.env.PORT = '65535';
      const { Config } = await import('@config');

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.port).toBe(65535);
    });

    it('should throw error when port out of range', async () => {
      // Arrange
      process.env.PORT = '65536';
      const { Config } = await import('@config');
      const { ConfigError } = await import('@shared');

      // Act & Assert
      expect(() => Config.getConfig()).toThrow(ConfigError);
    });
    it('should throw error when the env is production and logLevel as debug', async () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'debug';
      const { Config } = await import('@config');
      const { ConfigError } = await import('@shared');

      // Act & Assert
      expect(() => Config.getConfig()).toThrow(ConfigError);
    });

    it('should handle single cors origin when only one origin provided', async () => {
      // Arrange
      process.env.CORS_ORIGINS = 'https://single origin.com';
      const { Config } = await import('@config');

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.corsOrigins).toEqual(['https://single origin.com']);
    });

    it('should handle missing package version when package json invalid', async () => {
      // This test verifies the fallback version works
      // The mock already provides a version, but this tests the fallback logic

      // Arrange   Mock package.json without version
      jest.doMock('../../package.json', () => ({}), { virtual: true });
      const { Config } = await import('@config');
      Config.resetInstance();

      // Act
      const config = Config.getConfig();

      // Assert
      expect(config.version).toBe('0.0.0');
    });
  });

  describe('Integration with dotenv', () => {
    it('should call dotenv config when config created', async () => {
      // Arrange
      const dotenv = await import('dotenv');
      const { Config } = await import('@config');

      // Act
      Config.getConfig();

      // Assert
      expect(dotenv.config).toHaveBeenCalledWith({ override: false });
    });

    it('should not override existing env when dotenv config called', async () => {
      // Arrange
      const dotenv = await import('dotenv');
      const { Config } = await import('@config');

      // Act
      Config.getConfig();

      // Assert
      expect(dotenv.config).toHaveBeenCalledWith({ override: false });
    });
  });

  describe('Performance', () => {
    it('should create instance quickly when valid environment', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const { Config } = await import('@config');
      Config.getConfig();
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should return cached instance when called repeatedly', async () => {
      // Arrange
      const { Config } = await import('@config');
      const config1 = Config.getConfig();
      const startTime = Date.now();

      // Act
      const config2 = Config.getConfig();
      const endTime = Date.now();

      // Assert
      expect(config1).toBe(config2);
      expect(endTime - startTime).toBeLessThan(5); // Cached access should be instant
    });
  });
});
