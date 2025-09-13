import { buildContainer, TOKENS } from '@/container';
import { HealthController } from '@/presentation';

const ORIGINAL_ENV = process.env;

describe('buildContainer()', () => {
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { PORT: '4000', LOG_LEVEL: 'info', NODE_ENV: 'test' }; // Make a copy
  });
  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });
  it('should solve HealthController and a minimum payload delivery', () => {
    const container = buildContainer();
    const controller = container.resolve<HealthController>(TOKENS.HealthController);
    const result = controller.status();

    expect(result.service).toBe('oauth2');
    expect(result.status).toBe('ok');
    expect(typeof result.version).toBe('string');
    expect(typeof result.timestamp).toBe('string');
  });
});
