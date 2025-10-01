// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Mock package.json
jest.mock('../../../package.json', () => ({
  version: '1.2.3',
}));

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { CORS_ORIGINS: '*' };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should load default values when no env variables provided', async () => {
      const { Config } = await import('@config');
      const config = Config.getConfig();

      console.log(config);

      expect(config.port).toBe(4000);
      expect(config.nodeEnv).toBe('development');
      expect(config.logLevel).toBe('info');
      expect(config.serviceName).toBe('byteberry-oauth2');
    });
  });
  it('should load custom values when env variables provided', async () => {
    process.env.PORT = '5000';
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'error';
    process.env.SERVICE_NAME = 'custom service';

    const { Config } = await import('@config');
    const config = Config.getConfig();

    console.log(config);

    expect(config).toBeDefined();
    expect(config.port).toBe(5000);
    expect(config.nodeEnv).toBe('production');
    expect(config.logLevel).toBe('error');
    expect(config.serviceName).toBe('custom service');
    expect(config.isProduction()).toBeTruthy();
    expect(config.isDevelopment()).toBeFalsy();
    expect(config.isTest()).toBeFalsy();
  });
  it('should call dotenv config when instantiated', async () => {
    const dotenv = await import('dotenv');

    const { Config } = await import('@config');
    Config.getConfig();

    expect(dotenv.config).toHaveBeenCalledWith({ override: false });
  });
  it('should use package version when available', async () => {
    const { Config } = await import('@config');
    const config = Config.getConfig();

    expect(config.version).toBe('1.2.3');
  });
  it('should throw config error when invalid port provided', async () => {
    process.env.PORT = 'invalid port';

    const { Config } = await import('@config');

    expect(() => Config.getConfig()).toThrow(/PORT/);
  });
  it('should throw config error when invalid node env provided', async () => {
    process.env.NODE_ENV = 'invalid port';

    const { Config } = await import('@config');

    expect(() => Config.getConfig()).toThrow(/NODE_ENV/);
  });
  it('should throw config error when invalid log level provided', async () => {
    process.env.LOG_LEVEL = 'invalid port';

    const { Config } = await import('@config');

    expect(() => Config.getConfig()).toThrow(/LOG_LEVEL/);
  });
  it('should include context in error when validation fails', async () => {
    process.env.PORT = 'invalid port';
    const { ConfigError } = await import('@shared');

    // When & Then
    try {
      const { Config } = await import('@config');
      Config.getConfig();
      fail('Should have thrown ConfigError');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      expect((error as InstanceType<typeof ConfigError>).context).toHaveProperty('providedPort', 'invalid port');
      expect((error as InstanceType<typeof ConfigError>).context).toHaveProperty('originalError');
    }
  });
  it('should create new instance when reset instance called', async () => {
    const { Config } = await import('@config');

    const instance1 = Config.getConfig();

    Config.resetInstance();

    process.env.PORT = '5001';
    const instance2 = Config.getConfig();

    expect(instance1).not.toBe(instance2);
    expect(instance1.port).toBe(4000);
    expect(instance2.port).toBe(5001);
  });
  describe('getSummary', () => {
    it('should return complete config summary when called', async () => {
      // Given
      process.env.PORT = '5000';
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'warn';

      // When
      const { Config } = await import('@config');
      const config = Config.getConfig();
      const summary = config.getSummary();

      // Then
      expect(summary).toEqual({
        port: 5000,
        nodeEnv: 'production',
        logLevel: 'warn',
        isDevelopment: false,
        isProduction: true,
        isTest: false,
      });
    });

    it('should return serializable object when called', async () => {
      // When
      const { Config } = await import('@config');
      const config = Config.getConfig();
      const summary = config.getSummary();

      // Then
      expect(() => JSON.stringify(summary)).not.toThrow();
    });
  });

  describe('createConfig Factory', () => {
    it('should return config instance when called', async () => {
      // When
      const { createConfig, Config } = await import('@config');
      const config = createConfig();

      // Then
      expect(config).toBeInstanceOf(Config);
    });

    it('should return same singleton instance when called multiple times', async () => {
      // When
      const { createConfig } = await import('@config');
      const config1 = createConfig();
      const config2 = createConfig();

      // Then
      expect(config1).toBe(config2);
    });
  });
  describe('Version Fallback', () => {
    it('should use fallback version when both npm package version and pkg version undefined', async () => {
      // Given
      // Mock package.json para retornar version undefined
      jest.mock('../../../package.json', () => ({}), { virtual: true });

      // Asegurar que npm_package_version no está presente
      delete process.env.npm_package_version;

      // Resetear para aplicar el nuevo mock
      const { Config } = await import('@config');
      Config.resetInstance();
      jest.resetModules();

      // When
      const config = Config.getConfig();

      // Then
      expect(config.version).toBe('0.0.0');
    });

    it('should use npm package version when available', async () => {
      // Given
      process.env.npm_package_version = '2.3.4';
      const { Config } = await import('@config');
      Config.resetInstance();

      // When
      const config = Config.getConfig();

      // Then
      expect(config.version).toBe('2.3.4');
    });

    it('should prefer npm package version when both available', async () => {
      // Given
      process.env.npm_package_version = '2.3.4';
      // pkg.version ya está mockeado como '1.2.3' en el beforeAll
      const { Config } = await import('@config');
      Config.resetInstance();

      // When
      const config = Config.getConfig();

      // Then
      expect(config.version).toBe('2.3.4');
    });
  });
  describe('Error Handling   Non Error Objects', () => {
    it('should handle non error object when env var throws non standard error', async () => {
      // Given
      const mockGet = jest.fn().mockImplementation(() => {
        // Simular que env var lanza un objeto que no es Error
        throw { code: 'CUSTOM_ERROR', details: 'Something went wrong' };
      });

      // Mock del módulo env var
      jest.doMock('env-var', () => ({
        get: mockGet,
      }));

      // Resetear módulos para aplicar el mock
      jest.resetModules();

      const { Config: MockedConfig } = await import('@config');
      const { ConfigError } = await import('@shared');
      try {
        MockedConfig.getConfig();
        fail('Should have thrown ConfigError');
      } catch (error) {
        expect(error).toBeInstanceOf(ConfigError);
        expect((error as InstanceType<typeof ConfigError>).message).toContain('[object Object]');
        expect((error as InstanceType<typeof ConfigError>).context).toHaveProperty('originalError');
      }
    });
  });
});
