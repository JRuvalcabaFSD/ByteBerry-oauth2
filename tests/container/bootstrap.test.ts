import { bootstrapContainer, TOKENS } from '@/container';
import { IClock, IContainer, IEnvConfig, IUuid } from '@/interfaces';

describe('bootstrapContainer', () => {
  let container: IContainer;

  beforeEach(() => {
    container = bootstrapContainer();
  });

  afterEach(() => {
    container.clear();
  });
  describe('bootstrapContainer', () => {
    it('should register and resolve Config dependency', () => {
      const config = container.resolve<IEnvConfig>(TOKENS.Config);

      expect(config).toBeDefined();
      expect(typeof config.port).toBe('number');
      expect(typeof config.nodeEnv).toBe('string');
      expect(typeof config.logLevel).toBe('string');
    });
    it('should register and resolve Clock dependency', () => {
      const clock = container.resolve<IClock>(TOKENS.Clock);

      expect(clock).toBeDefined();
      expect(clock.now()).toBeInstanceOf(Date);
      expect(typeof clock.timestamp()).toBe('number');
    });
    it('should register and resolve Uuid dependency', () => {
      const uuid = container.resolve<IUuid>(TOKENS.Uuid);

      expect(uuid).toBeDefined();
      expect(typeof uuid.generate()).toBe('string');
      expect(uuid.generate()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
  describe('singleton behavior', () => {
    it('should return same instance for Config (singleton)', () => {
      const config1 = container.resolve<IEnvConfig>(TOKENS.Config);
      const config2 = container.resolve<IEnvConfig>(TOKENS.Config);

      expect(config1).toBe(config2);
    });
    it('should register all required F0 tokens', () => {
      const registerTokens = container.getRegisteredTokens();

      expect(registerTokens).toHaveLength(4);
      expect(container.isRegistered(TOKENS.Config)).toBeTruthy();
      expect(container.isRegistered(TOKENS.Clock)).toBeTruthy();
      expect(container.isRegistered(TOKENS.Uuid)).toBeTruthy();
      //TODO test for rest basic services
    });
  });
});
