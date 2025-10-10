import { bootstrapContainer } from '@/container';

describe('bootstrapContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Container Creation', () => {
    it('should_CreateContainerInstance_When_Called', () => {
      const container = bootstrapContainer();

      expect(container).toBeDefined();
      expect(typeof container.resolve).toBe('function');
      expect(typeof container.register).toBe('function');
      expect(typeof container.isRegistered).toBe('function');
    });
  });
  describe('Critical Services Validation - Line 36 Coverage', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });
    it('should_ThrowContainerCreationError_When_CriticalServiceNotRegistered', async () => {
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
