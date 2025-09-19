describe('EnvConfig', () => {
  const originalEnvs = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });
  afterEach(() => {
    process.env = { ...originalEnvs };
  });
  describe('constructor', () => {
    it('should load default values when no environment variables are set', async () => {
      const { EnvConfig } = await import('@config');

      const config = new EnvConfig();

      expect(config.port).toBe(4000);
      expect(config.nodeEnv).toBe('development');
      expect(config.logLevel).toBe('info');
    });
    it('should load custom values from environment variables', async () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'debug';

      const { EnvConfig } = await import('@config');

      const config = new EnvConfig();
      console.log(config);

      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe('production');
      expect(config.logLevel).toBe('debug');
    });
    it('should throw error for invalid values', async () => {
      await jest.isolateModulesAsync(async () => {
        const { EnvConfig } = await import('@config');
        process.env.PORT = '700000';

        expect(() => new EnvConfig()).toThrow(/65535/);
        process.env = {};
      });

      await jest.isolateModulesAsync(async () => {
        process.env.NODE_ENV = 'invalid value';
        const { EnvConfig } = await import('@config');

        expect(() => new EnvConfig()).toThrow(/"NODE_ENV"/);
        jest.resetModules();
        process.env = {};
      });

      await jest.isolateModulesAsync(async () => {
        process.env.LOG_LEVEL = 'invalid value';
        const { EnvConfig } = await import('@config');

        expect(() => new EnvConfig()).toThrow(/"LOG_LEVEL"/);
        jest.resetModules();
        process.env = {};
      });
    });
  });
  describe('environment check methods', () => {
    it('should correctly identify development environment', async () => {
      process.env.NODE_ENV = 'development';
      const { EnvConfig } = await import('@config');
      const config = new EnvConfig();

      expect(config.isDevelopment()).toBeTruthy();
      expect(config.isProduction()).toBeFalsy();
      expect(config.isTest()).toBeFalsy();
    });
    it('should correctly identify production environment', async () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      const { EnvConfig } = await import('@config');
      const config = new EnvConfig();

      expect(config.isDevelopment()).toBeFalsy();
      expect(config.isProduction()).toBeTruthy();
      expect(config.isTest()).toBeFalsy();
    });
  });
});
