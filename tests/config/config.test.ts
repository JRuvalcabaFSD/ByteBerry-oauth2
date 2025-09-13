import { AppConfig } from '@/config';

const ORIGINAL_ENV = process.env;

describe('loadConfig()', () => {
  beforeEach(() => {
    jest.resetModules(); // Clear the cache
    process.env = {}; // Reset process.env to its original state
  });
  afterEach(() => {
    process.env = ORIGINAL_ENV; // Restore original environment
  });

  async function getLoadConfig() {
    const mod = await import('@/config');
    return mod.loadConfig as () => AppConfig;
  }
  it('carga valores válidos con defaults', async () => {
    const loadConfig = await getLoadConfig();
    const cfg = loadConfig();

    expect(cfg.nodeEnv).toBe('development');
    expect(cfg.port).toBe(4000);
    expect(cfg.logLevel).toBe('info');
  });

  it("should fail if node_env is not 'development', 'production' or 'test'", async () => {
    process.env.NODE_ENV = 'invalid_env';
    const loadConfig = await getLoadConfig();
    expect(() => loadConfig()).toThrow(`"NODE_ENV" should be one of [development, production, test]`);
  });
  it("should fail if LOG_LEVEL is not 'debug', 'info', 'warn', 'error'", async () => {
    process.env.LOG_LEVEL = 'invalid_level';
    const loadConfig = await getLoadConfig();
    expect(() => loadConfig()).toThrow(`"LOG_LEVEL" should be one of [debug, info, warn, error]`);
  });
  it('should fail if PORT is not a valid port', async () => {
    process.env.PORT = '700000'; // Puerto inválido
    const loadConfig = await getLoadConfig();
    expect(() => loadConfig()).toThrow(`"PORT" cannot assign a port number greater than 65535`);
  });
});
