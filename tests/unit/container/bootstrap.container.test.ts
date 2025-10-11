import { bootstrapContainer } from '@/container';

describe('bootstrapContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Container Creation', () => {
    it('should create container instance when called', () => {
      const container = bootstrapContainer();

      expect(container).toBeDefined();
      expect(typeof container.resolve).toBe('function');
      expect(typeof container.register).toBe('function');
      expect(typeof container.isRegistered).toBe('function');
    });
  });
  describe('Critical Services Validation', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });
    it('should throw container creation error when critical service not registered', async () => {
      await jest.isolateModulesAsync(async () => {
        const mod = await import('@container');
        const { ContainerError } = await import('@shared');

        (mod.criticalServices as unknown as Array<{ token: symbol; name: string }>).push({
          token: Symbol.for('__TEST_MISSING__'),
          name: '__TEST_MISSING__',
        });

        expect(() => mod.bootstrapContainer()).toThrow(ContainerError);

        try {
          mod.bootstrapContainer();
        } catch (error) {
          expect(String((error as Error).message)).toMatch(/__TEST_MISSING__/);
        }
      });
    });
  });
});
