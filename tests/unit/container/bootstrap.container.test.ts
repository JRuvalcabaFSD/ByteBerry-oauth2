import { bootstrapContainer } from '@/container';

// Mock de las factories
jest.mock('@/config', () => ({
  createConfig: jest.fn(() => ({
    port: 4000,
    nodeEnv: 'test',
    logLevel: 'info',
    serviceName: 'test-service',
    version: '1.0.0',
    isDevelopment: () => false,
    isProduction: () => false,
    isTest: () => true,
    getSummary: () => ({}),
  })),
}));

jest.mock('@/infrastructure', () => ({
  createClockService: jest.fn(() => ({
    now: () => new Date(),
    timestamp: () => Date.now(),
    isoString: () => new Date().toISOString(),
  })),
  createUuidService: jest.fn(() => ({
    generate: () => 'test-uuid',
    isValid: (uuid: string) => typeof uuid === 'string',
  })),
}));

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
    it('should_ThrowContainerCreationError_When_CriticalServiceNotRegistered', async () => {
      // Given - Mock Container que omite el registro de Config
      await jest.isolateModulesAsync(async () => {
        jest.doMock('@/container/container', () => ({
          Container: class MockContainer {
            private services = new Map<symbol, any>();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            register(token: symbol, factory: Function) {
              // Intencionalmente NO registrar Config para forzar el error
              if (token.description !== 'Config') {
                this.services.set(token, { factory, lifecycle: 'transient' });
              }
            }

            isRegistered(token: symbol): boolean {
              return this.services.has(token);
            }

            resolve() {
              return {};
            }

            registerSingleton() {}
            registerInstance() {}
          },
        }));

        const { bootstrapContainer } = await import('@/container/bootstrap.container');
        const { TOKENS } = await import('@/container/tokens');
        const { ContainerCreationError } = await import('@/shared/errors/container.errors');

        // When & Then
        try {
          bootstrapContainer();
          fail('Should have thrown ContainerCreationError');
        } catch (error) {
          expect(error).toBeInstanceOf(ContainerCreationError);
          const containerError = error as InstanceType<typeof ContainerCreationError>;
          expect(containerError.token).toBe(TOKENS.Config);
          expect(containerError.message).toContain('Config');
          expect(containerError.message).toContain('not registered');
        }
      });
    });
  });
});
