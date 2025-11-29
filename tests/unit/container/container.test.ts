import { Container } from '@/container';
import { IConfig } from '@/interfaces';
import { CircularDependencyError, ContainerError, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

// Mock completo de IConfig con factory helper
const createMockConfig = (overrides: Partial<IConfig> = {}): IConfig => ({
  nodeEnv: 'test',
  port: 4000,
  logLevel: 'info',
  serviceName: 'ByteBerry-OAuth2',
  jwtPrivateKey: '',
  jwtPublicKey: '',
  jwtKeyId: '',
  jwtAudience: [],
  corsOrigins: ['http://localhost:5173'],
  version: '0.1.0',
  oauth2Issuer: 'byteberry-oauth2',
  tokenExpiresIn: 900,
  isDevelopment: () => false,
  isProduction: () => false,
  isTest: () => true,
  getSummary: () => ({}),
  databaseUrl: '',
  ...overrides,
});

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register', () => {
    it('should register service when valid token and factory', () => {
      // Act
      container.register('Config', () => createMockConfig());

      // Assert
      expect(container.isRegistered('Config')).toBe(true);
    });

    it('should throw token already registered error when token exists', () => {
      // Arrange
      container.register('Config', () => createMockConfig());

      // Act & Assert
      expect(() => container.register('Config', () => createMockConfig({ port: 5000 }))).toThrow(TokenAlreadyRegisteredError);
    });
  });

  describe('registerSingleton', () => {
    it('should return same instance when resolving multiple times', () => {
      // Arrange
      container.registerSingleton('Config', () => createMockConfig());

      // Act
      const instance1 = container.resolve('Config');
      const instance2 = container.resolve('Config');

      // Assert
      expect(instance1).toBe(instance2);
    });

    it('should throw token already registered error when token exists', () => {
      // Arrange
      container.registerSingleton('Config', () => createMockConfig());

      // Act & Assert
      expect(() => container.registerSingleton('Config', () => createMockConfig({ port: 5000 }))).toThrow(TokenAlreadyRegisteredError);
    });
  });

  describe('registerInstance', () => {
    it('should return registered instance when resolved', () => {
      // Arrange
      const configInstance = createMockConfig();
      container.registerInstance('Config', configInstance);

      // Act
      const resolved = container.resolve('Config');

      // Assert
      expect(resolved).toBe(configInstance);
    });

    it('should throw token already registered error when token exists', () => {
      // Arrange
      const instance1 = createMockConfig();
      const instance2 = createMockConfig({ port: 5000 });
      container.registerInstance('Config', instance1);

      // Act & Assert
      expect(() => container.registerInstance('Config', instance2)).toThrow(TokenAlreadyRegisteredError);
    });
  });

  describe('resolve', () => {
    it('should resolve service when token registered', () => {
      // Arrange
      const expectedConfig = createMockConfig({ port: 4000 });
      container.register('Config', () => expectedConfig);

      // Act
      const resolved = container.resolve('Config');

      // Assert
      expect(resolved).toEqual(expectedConfig);
    });

    it('should throw token not registered error when token not found', () => {
      // Act & Assert
      expect(() => container.resolve('Config')).toThrow(TokenNotRegisteredError);
    });

    it('should throw container error when factory fails', () => {
      // Arrange
      container.register('Config', () => {
        throw new Error('Factory failed');
      });

      // Act & Assert
      expect(() => container.resolve('Config')).toThrow(ContainerError);
    });
  });

  describe('isRegistered', () => {
    it('should return true when token is registered', () => {
      // Arrange
      container.register('Config', () => createMockConfig());

      // Act & Assert
      expect(container.isRegistered('Config')).toBe(true);
    });

    it('should return false when token is not registered', () => {
      // Act & Assert
      expect(container.isRegistered('Config')).toBe(false);
    });
  });

  describe('lifecycle behavior', () => {
    it('should create new instances when transient service', () => {
      // Arrange
      let counter = 0;
      container.register('Config', () => createMockConfig({ port: 4000 + ++counter }));

      // Act
      const instance1 = container.resolve('Config');
      const instance2 = container.resolve('Config');

      // Assert
      expect(instance1.port).toBe(4001);
      expect(instance2.port).toBe(4002);
      expect(instance1).not.toBe(instance2);
    });

    it('should cache instance when singleton service', () => {
      // Arrange
      let counter = 0;
      container.registerSingleton('Config', () => createMockConfig({ port: 4000 + ++counter }));

      // Act
      const instance1 = container.resolve('Config');
      const instance2 = container.resolve('Config');

      // Assert
      expect(instance1.port).toBe(4001);
      expect(instance2.port).toBe(4001);
      expect(instance1).toBe(instance2);
    });
  });
  // ... tests existentes ...

  describe('circular dependency detection', () => {
    it('should throw circular dependency error when service depends on itself', () => {
      // Arrange
      container.registerSingleton('Config', c => {
        // Service que intenta resolverse a sí mismo
        c.resolve('Config');
        return createMockConfig();
      });

      // Act & Assert
      expect(() => container.resolve('Config')).toThrow(CircularDependencyError);
      expect(() => container.resolve('Config')).toThrow('Circular dependency detected: Config -> Config');
    });

    it('should throw circular dependency error when complex circular dependency', () => {
      // Arrange
      // Mock temporal para simular dependencia circular más compleja
      const containerWithCircular = new Container();

      // Registrar servicios que se dependen mutuamente usando any para bypass de tipos
      (containerWithCircular as any).register('ServiceA', (c: any) => {
        const serviceB = c.resolve('ServiceB');
        return { name: 'A', dependency: serviceB };
      });

      (containerWithCircular as any).register('ServiceB', (c: any) => {
        const serviceA = c.resolve('ServiceA');
        return { name: 'B', dependency: serviceA };
      });

      // Act & Assert
      expect(() => (containerWithCircular as any).resolve('ServiceA')).toThrow(CircularDependencyError);
      expect(() => (containerWithCircular as any).resolve('ServiceA')).toThrow(
        'Circular dependency detected: ServiceA -> ServiceB -> ServiceA'
      );
    });
  });
});
