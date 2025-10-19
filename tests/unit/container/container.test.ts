import { Container, ServiceMap } from '@/container';
import { CircularDependencyError, ContainerError, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

describe('Container', () => {
  let container: Container<ServiceMap>;

  beforeEach(() => {
    container = new Container<ServiceMap>();
  });

  describe('Service Registration', () => {
    describe('register (Transient)', () => {
      it('should register transient service when valid token and factory provided', () => {
        const factory = () => ({ getValue: () => 'test' });

        expect(() => container.register('Config', factory)).not.toThrow();
      });
      it('should throw token already registered error when token already exists', () => {
        const factory = () => ({ getValue: () => 'test' });
        container.register('Config', factory);

        expect(() => container.register('Config', factory)).toThrow(TokenAlreadyRegisteredError);
        expect(() => container.register('Config', factory)).toThrow("Token 'Config' is already registered");
      });
      it('should allow different tokens when registering multiple services', () => {
        const factoryA = () => ({ getValue: () => 'A' });
        const factoryB = () => ({ getValue: () => 'B' });

        // Act & Assert
        expect(() => {
          container.register('Config', factoryA);
          container.register('Logger', factoryB);
        }).not.toThrow();
      });
    });
    describe('registerSingleton', () => {
      it('should register singleton service when valid token and factory provided', () => {
        // Arrange
        const factory = () => ({ getValue: () => 'singleton' });

        // Act & Assert
        expect(() => container.registerSingleton('Config', factory)).not.toThrow();
      });

      it('should throw token already registered error when token already exists', () => {
        // Arrange
        const factory = () => ({ getValue: () => 'test' });
        container.registerSingleton('Config', factory);

        // Act & Assert
        expect(() => container.registerSingleton('Config', factory)).toThrow(TokenAlreadyRegisteredError);
      });

      it('should prevent mixed registration when token already registered as transient', () => {
        // Arrange
        const factory = () => ({ getValue: () => 'test' });
        container.register('Config', factory);

        // Act & Assert
        expect(() => container.registerSingleton('Config', factory)).toThrow(TokenAlreadyRegisteredError);
      });
    });
    describe('registerInstance', () => {
      it('should register instance when valid token and instance provided', () => {
        // Arrange
        const instance = { getValue: () => 'instance' };

        // Act & Assert
        expect(() => container.registerInstance('Config', instance)).not.toThrow();
      });

      it('should throw token already registered error when token already exists', () => {
        // Arrange
        const instance1 = { getValue: () => 'first' };
        const instance2 = { getValue: () => 'second' };
        container.registerInstance('Config', instance1);

        // Act & Assert
        expect(() => container.registerInstance('Config', instance2)).toThrow(TokenAlreadyRegisteredError);
      });

      it('should accept null instance when null provided', () => {
        // Act & Assert
        expect(() => container.registerInstance('Config', null)).not.toThrow();
      });

      it('should accept undefined instance when undefined provided', () => {
        // Act & Assert
        expect(() => container.registerInstance('Config', undefined)).not.toThrow();
      });
    });
  });
  describe('Service Resolution', () => {
    interface MockInterface1 {
      getValue: () => string;
    }

    interface ServiceMap {
      Config: MockInterface1;
      Logger: MockInterface1;
      Clock: MockInterface1;
      Uuid: MockInterface1;
    }

    let container: Container<ServiceMap>;

    beforeEach(() => {
      container = new Container<ServiceMap>();
    });

    describe('Transient Services', () => {
      it('should create new instance when resolving transient service', () => {
        let callCount = 0;
        const factory = () => ({ getValue: () => `instance ${++callCount}` });
        container.register('Config', factory);

        const instance1 = container.resolve('Config');
        const instance2 = container.resolve('Config');

        expect(instance1).not.toBe(instance2);
        expect(instance1.getValue()).toBe('instance 1');
        expect(instance2.getValue()).toBe('instance 2');
      });
      it('should call factory when resolving transient service', () => {
        // Arrange
        const mockFactory = jest.fn(() => ({ getValue: () => 'test' }));
        container.register('Config', mockFactory);

        // Act
        container.resolve('Config');
        container.resolve('Config');

        // Assert
        expect(mockFactory).toHaveBeenCalledTimes(2);
        expect(mockFactory).toHaveBeenCalledWith(container);
      });
    });
    describe('Singleton Services', () => {
      it('should return same instance when resolving singleton multiple times', () => {
        // Arrange
        const factory = () => ({ getValue: () => 'singleton' });
        container.registerSingleton('Config', factory);

        // Act
        const instance1 = container.resolve('Config');
        const instance2 = container.resolve('Config');

        // Assert
        expect(instance1).toBe(instance2);
        expect(instance1.getValue()).toBe('singleton');
      });

      it('should call factory once when resolving singleton multiple times', () => {
        // Arrange
        const mockFactory = jest.fn(() => ({ getValue: () => 'singleton' }));
        container.registerSingleton('Config', mockFactory);

        // Act
        container.resolve('Config');
        container.resolve('Config');
        container.resolve('Config');

        // Assert
        expect(mockFactory).toHaveBeenCalledTimes(1);
        expect(mockFactory).toHaveBeenCalledWith(container);
      });

      it('should cache instance after first resolution when resolving singleton', () => {
        // Arrange
        let created = false;
        const factory = () => {
          expect(created).toBe(false); // Should only be called once
          created = true;
          return { getValue: () => 'cached' };
        };
        container.registerSingleton('Config', factory);

        // Act
        const instance1 = container.resolve('Config');
        const instance2 = container.resolve('Config');

        // Assert
        expect(instance1).toBe(instance2);
        expect(created).toBe(true);
      });
    });
    describe('Instance Services', () => {
      it('should return registered instance when resolving instance service', () => {
        // Arrange
        const originalInstance = { getValue: () => 'registered' };
        container.registerInstance('Config', originalInstance);

        // Act
        const resolvedInstance = container.resolve('Config');

        // Assert
        expect(resolvedInstance).toBe(originalInstance);
      });

      it('should return same instance when resolving instance multiple times', () => {
        // Arrange
        const originalInstance = { getValue: () => 'registered' };
        container.registerInstance('Config', originalInstance);

        // Act
        const instance1 = container.resolve('Config');
        const instance2 = container.resolve('Config');

        // Assert
        expect(instance1).toBe(instance2);
        expect(instance1).toBe(originalInstance);
      });

      it('should return null instance when null was registered', () => {
        // Arrange
        container.registerInstance('Config', null);

        // Act
        const instance = container.resolve('Config');

        // Assert
        expect(instance).toBeNull();
      });
    });
    describe('Error Cases', () => {
      it('should throw token not registered error when resolving unregistered token', () => {
        // Act & Assert
        expect(() => container.resolve('Config')).toThrow(TokenNotRegisteredError);
        expect(() => container.resolve('Config')).toThrow("Token 'Config' is not registered");
      });

      it('should wrap factory error when factory throws', () => {
        // Arrange
        const factory = () => {
          throw new Error('Factory failed');
        };
        container.register('Config', factory);

        // Act & Assert
        expect(() => container.resolve('Config')).toThrow(ContainerError);
        expect(() => container.resolve('Config')).toThrow("Failed to resolve service 'Config': Factory failed");
      });

      it('should include token in error when factory throws', () => {
        // Arrange
        const factory = () => {
          throw new Error('Custom error');
        };
        container.register('Logger', factory);

        // Act & Assert
        try {
          container.resolve('Logger');
          fail('Expected ContainerError to be thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(ContainerError);
          expect((error as ContainerError).token).toBe('Logger');
        }
      });

      it('should propagate circular dependency error when factory throws circular error', () => {
        // Arrange
        const circularError = new CircularDependencyError(['Config', 'Logger'], 'Config');
        const factory = () => {
          throw circularError;
        };
        container.register('Config', factory);

        // Act & Assert
        expect(() => container.resolve('Config')).toThrow(CircularDependencyError);
        expect(() => container.resolve('Config')).toThrow(circularError);
      });
    });
  });
  describe('Circular Dependency Detection', () => {
    it('should detect simple circular dependency when service depends on itself', () => {
      // Arrange
      container.register('Config', c => c.resolve('Config'));

      // Act & Assert
      expect(() => container.resolve('Config')).toThrow(CircularDependencyError);
      expect(() => container.resolve('Config')).toThrow('Circular dependency detected: Config -> Config');
    });

    it('should detect two service circular dependency when services circularly depend', () => {
      // Arrange
      container.register('Config', c => ({ dep: c.resolve('Logger') }));
      container.register('Logger', c => ({ dep: c.resolve('Config') }));

      // Act & Assert
      expect(() => container.resolve('Config')).toThrow(CircularDependencyError);
      expect(() => container.resolve('Config')).toThrow('Circular dependency detected: Config -> Logger -> Config');
    });

    it('should detect complex circular dependency when long chain circularly depends', () => {
      // Arrange
      container.register('Config', c => ({ dep: c.resolve('Logger') }));
      container.register('Logger', c => ({ dep: c.resolve('Clock') }));
      container.register('Clock', c => ({ dep: c.resolve('Uuid') }));
      container.register('Uuid', c => ({ dep: c.resolve('Config') }));

      // Act & Assert
      expect(() => container.resolve('Config')).toThrow(CircularDependencyError);
      expect(() => container.resolve('Config')).toThrow('Circular dependency detected: Config -> Logger -> Clock -> Uuid -> Config');
    });

    it('should reset resolution stack when resolution completes', () => {
      // Arrange
      container.register('Config', () => ({ value: 'config' }));
      container.register('Logger', c => ({ config: c.resolve('Config') }));

      // Act
      container.resolve('Logger'); // This should complete successfully

      // Assert   resolving again should work (stack was reset)
      expect(() => container.resolve('Logger')).not.toThrow();
    });

    it('should reset resolution stack when resolution fails', () => {
      // Arrange
      container.register('Config', () => {
        throw new Error('Factory error');
      });

      // Act & Assert
      expect(() => container.resolve('Config')).toThrow(ContainerError);

      // Stack should be reset even after error
      expect(() => container.resolve('Config')).toThrow(ContainerError);
      expect(() => container.resolve('Config')).not.toThrow(CircularDependencyError);
    });
  });

  describe('Service Registration Check', () => {
    it('should return true when service is registered', () => {
      // Arrange
      container.register('Config', () => ({ value: 'test' }));

      // Act & Assert
      expect(container.isRegistered('Config')).toBe(true);
    });

    it('should return false when service is not registered', () => {
      // Act & Assert
      expect(container.isRegistered('Config')).toBe(false);
    });

    it('should return true when singleton is registered', () => {
      // Arrange
      container.registerSingleton('Logger', () => ({ log: () => {} }));

      // Act & Assert
      expect(container.isRegistered('Logger')).toBe(true);
    });

    it('should return true when instance is registered', () => {
      // Arrange
      container.registerInstance('Clock', { now: () => new Date() });

      // Act & Assert
      expect(container.isRegistered('Clock')).toBe(true);
    });

    it('should return true for all registered services when multiple services registered', () => {
      // Arrange
      container.register('Config', () => ({}));
      container.registerSingleton('Logger', () => ({}));
      container.registerInstance('Clock', {});

      // Act & Assert
      expect(container.isRegistered('Config')).toBe(true);
      expect(container.isRegistered('Logger')).toBe(true);
      expect(container.isRegistered('Clock')).toBe(true);
      expect(container.isRegistered('Uuid')).toBe(false);
    });
  });
  describe('Type Safety and Generics', () => {
    interface ITypedService {
      getValue(): string;
      getNumber(): number;
    }

    interface IComplexFactory {
      nested: {
        value: string;
        array: number[];
        method: () => string;
      };
    }

    interface ServiceMap {
      Config: ITypedService;
      Logger: IComplexFactory;
      Clock: ITypedService;
      Uuid: ITypedService;
    }

    let container: Container<ServiceMap>;

    beforeEach(() => {
      container = new Container<ServiceMap>();
    });
    it('should maintain type information when resolving typed service', () => {
      // Arrange
      interface ITypedService {
        getValue(): string;
        getNumber(): number;
      }

      const factory = (): ITypedService => ({
        getValue: () => 'typed',
        getNumber: () => 42,
      });

      container.register('Config', factory);

      // Act
      const service = container.resolve('Config');

      // Assert
      expect(service.getValue()).toBe('typed');
      expect(service.getNumber()).toBe(42);
    });

    it('should preserve factory return type when registering service', () => {
      // Arrange
      const complexFactory = () => ({
        nested: {
          value: 'complex',
          array: [1, 2, 3],
          method: () => 'result',
        },
      });

      container.registerSingleton('Logger', complexFactory);

      // Act
      const service = container.resolve('Logger');

      // Assert
      expect(service.nested.value).toBe('complex');
      expect(service.nested.array).toEqual([1, 2, 3]);
      expect(service.nested.method()).toBe('result');
    });
  });
  describe('Edge Cases and Error Recovery', () => {
    it('should handle factory returning undefined when factory returns undefined', () => {
      // Arrange
      container.register('Config', () => undefined);

      // Act
      const service = container.resolve('Config');

      // Assert
      expect(service).toBeUndefined();
    });

    it('should handle factory returning null when factory returns null', () => {
      // Arrange
      container.register('Logger', () => null);

      // Act
      const service = container.resolve('Logger');

      // Assert
      expect(service).toBeNull();
    });

    it('should handle async factory when factory returns promise', () => {
      // Arrange
      container.register('Config', () => Promise.resolve({ async: true }));

      // Act
      const service = container.resolve('Config');

      // Assert
      expect(service).toBeInstanceOf(Promise);
    });

    it('should maintain isolation when multiple container instances', () => {
      // Arrange
      const container1 = new Container();
      const container2 = new Container();

      container1.register('Config', () => ({ instance: 1 }));
      container2.register('Config', () => ({ instance: 2 }));

      // Act
      const service1 = container1.resolve('Config');
      const service2 = container2.resolve('Config');

      // Assert
      expect(service1.instance).toBe(1);
      expect(service2.instance).toBe(2);
      expect(container1.isRegistered('Logger')).toBe(false);
      expect(container2.isRegistered('Logger')).toBe(false);
    });
  });

  describe('Performance Characteristics', () => {
    it('should resolve quickly when resolving many services', () => {
      // Arrange
      for (let i = 0; i < 100; i++) {
        container.register(`Service${i}` as any, () => ({ id: i }));
      }

      // Act
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        container.resolve(`Service${i}` as any);
      }
      const endTime = Date.now();

      // Assert
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should cache singleton efficiently when resolving many singletons', () => {
      // Arrange
      let factoryCallCount = 0;
      container.registerSingleton('Config', () => {
        factoryCallCount++;
        return { calls: factoryCallCount };
      });

      // Act
      for (let i = 0; i < 1000; i++) {
        container.resolve('Config');
      }

      // Assert
      expect(factoryCallCount).toBe(1);
    });
  });
});
