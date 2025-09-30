import { Container } from '@/container';
import { IContainer } from '@/interfaces';
import { CircularDependencyError, ContainerError, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

describe('Container', () => {
  let container: IContainer;
  const token = Symbol('TestService');
  const factory = () => ({ value: 'test' });

  beforeEach(() => {
    container = new Container();
  });

  describe('register', () => {
    it('should_RegisterTransientService_When_ValidFactoryProvided', () => {
      container.register(token, factory);

      expect(container.isRegistered(token)).toBeTruthy();
    });
    it('should_CreateNewInstanceEachTime_When_TransientServiceResolved', () => {
      container.register(token, () => ({ id: Math.random() }));

      const instance1 = container.resolve<{ id: number }>(token);
      const instance2 = container.resolve<{ id: number }>(token);

      expect(instance1).not.toBe(instance2);
      expect(instance1.id).not.toBe(instance2);
    });
    it('should_ThrowTokenAlreadyRegisteredError_When_TokenAlreadyRegistered', () => {
      container.register(token, () => ({}));

      expect(() => container.register(token, () => ({}))).toThrow(TokenAlreadyRegisteredError);
    });
    it('should_AllowFactoryToUseDependencies_When_ContainerPassed', () => {
      const configToken = Symbol('Config');
      const serviceToken = Symbol('Service');

      container.registerInstance(configToken, { port: 4000 });
      container.register(serviceToken, c => {
        const config = c.resolve<{ port: number }>(configToken);
        return { port: config.port };
      });

      const service = container.resolve<{ port: number }>(serviceToken);

      expect(service.port).toBe(4000);
    });
  });
  describe('registerSingleton', () => {
    it('should_RegisterSingletonService_When_ValidFactoryProvided', () => {
      // Given
      const token = Symbol('SingletonService');
      const factory = () => ({ value: 'singleton' });

      // When
      container.registerSingleton(token, factory);

      // Then
      expect(container.isRegistered(token)).toBe(true);
    });

    it('should_ReturnSameInstance_When_SingletonResolvedMultipleTimes', () => {
      // Given
      const token = Symbol('SingletonService');
      container.registerSingleton(token, () => ({ id: Math.random() }));

      // When
      const instance1 = container.resolve<{ id: number }>(token);
      const instance2 = container.resolve<{ id: number }>(token);

      // Then
      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(instance2.id);
    });

    it('should_ThrowTokenAlreadyRegisteredError_When_TokenAlreadyRegistered', () => {
      // Given
      const token = Symbol('DuplicateSingleton');
      container.registerSingleton(token, () => ({}));

      // When & Then
      expect(() => container.registerSingleton(token, () => ({}))).toThrow(TokenAlreadyRegisteredError);
    });

    it('should_CallFactoryOnlyOnce_When_SingletonResolvedMultipleTimes', () => {
      // Given
      const token = Symbol('SingletonService');
      const factory = jest.fn(() => ({ value: 'test' }));
      container.registerSingleton(token, factory);

      // When
      container.resolve(token);
      container.resolve(token);
      container.resolve(token);

      // Then
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });
  describe('registerInstance', () => {
    it('should_RegisterExistingInstance_When_Called', () => {
      // Given
      const token = Symbol('InstanceService');
      const instance = { value: 'existing' };

      // When
      container.registerInstance(token, instance);

      // Then
      expect(container.isRegistered(token)).toBe(true);
    });

    it('should_ReturnSameInstance_When_Resolved', () => {
      // Given
      const token = Symbol('InstanceService');
      const instance = { id: 123 };
      container.registerInstance(token, instance);

      // When
      const resolved1 = container.resolve<{ id: number }>(token);
      const resolved2 = container.resolve<{ id: number }>(token);

      // Then
      expect(resolved1).toBe(instance);
      expect(resolved2).toBe(instance);
      expect(resolved1).toBe(resolved2);
    });

    it('should_ThrowTokenAlreadyRegisteredError_When_TokenAlreadyRegistered', () => {
      // Given
      const token = Symbol('DuplicateInstance');
      container.registerInstance(token, {});

      // When & Then
      expect(() => container.registerInstance(token, {})).toThrow(TokenAlreadyRegisteredError);
    });

    it('should_NotCallFactory_When_InstanceAlreadyProvided', () => {
      // Given
      const token = Symbol('InstanceService');
      const instance = { value: 'test' };
      container.registerInstance(token, instance);

      // When
      const resolved = container.resolve(token);

      // Then - Factory should not be called since instance is already provided
      expect(resolved).toBe(instance);
    });
  });
  describe('resolve', () => {
    it('should_ResolveService_When_TokenRegistered', () => {
      // Given
      const token = Symbol('Service');
      const expectedValue = { data: 'test' };
      container.register(token, () => expectedValue);

      // When
      const resolved = container.resolve(token);

      // Then
      expect(resolved).toEqual(expectedValue);
    });

    it('should_ThrowTokenNotRegisteredError_When_TokenNotRegistered', () => {
      // Given
      const token = Symbol('UnregisteredService');

      // When & Then
      expect(() => container.resolve(token)).toThrow(TokenNotRegisteredError);
    });

    it('should_PassContainerToFactory_When_Resolving', () => {
      // Given
      const token = Symbol('Service');
      const factory = jest.fn((c: IContainer) => {
        expect(c).toBe(container);
        return {};
      });
      container.register(token, factory);

      // When
      container.resolve(token);

      // Then
      expect(factory).toHaveBeenCalledWith(container);
    });

    it('should_ResolveNestedDependencies_When_ServiceDependsOnOtherServices', () => {
      // Given
      const configToken = Symbol('Config');
      const loggerToken = Symbol('Logger');
      const serviceToken = Symbol('Service');

      container.registerInstance(configToken, { env: 'test' });
      container.registerSingleton(loggerToken, c => {
        const config = c.resolve<{ env: string }>(configToken);
        return { env: config.env };
      });
      container.register(serviceToken, c => {
        const logger = c.resolve<{ env: string }>(loggerToken);
        return { loggerEnv: logger.env };
      });

      // When
      const service = container.resolve<{ loggerEnv: string }>(serviceToken);

      // Then
      expect(service.loggerEnv).toBe('test');
    });
  });
  describe('Circular Dependency Detection', () => {
    it('should_ThrowCircularDependencyError_When_DirectCircularDependency', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      container.register(tokenA, c => {
        c.resolve(tokenA); // Circular dependency
        return {};
      });

      // When & Then
      expect(() => container.resolve(tokenA)).toThrow(CircularDependencyError);
    });

    it('should_ThrowCircularDependencyError_When_IndirectCircularDependency', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');

      container.register(tokenA, c => {
        c.resolve(tokenB);
        return {};
      });
      container.register(tokenB, c => {
        c.resolve(tokenA); // Circular: A -> B -> A
        return {};
      });

      // When & Then
      expect(() => container.resolve(tokenA)).toThrow(CircularDependencyError);
    });

    it('should_IncludeDependencyChain_When_CircularDependencyDetected', () => {
      // Given
      const tokenA = Symbol.for('ServiceA');
      const tokenB = Symbol.for('ServiceB');
      const tokenC = Symbol.for('ServiceC');

      container.register(tokenA, c => {
        c.resolve(tokenB);
        return {};
      });
      container.register(tokenB, c => {
        c.resolve(tokenC);
        return {};
      });
      container.register(tokenC, c => {
        c.resolve(tokenA); // Circular: A -> B -> C -> A
        return {};
      });

      // When & Then
      try {
        container.resolve(tokenA);
        fail('Should have thrown CircularDependencyError');
      } catch (error) {
        expect(error).toBeInstanceOf(CircularDependencyError);
        expect((error as Error).message).toContain('ServiceA');
        expect((error as Error).message).toContain('ServiceB');
        expect((error as Error).message).toContain('ServiceC');
      }
    });
  });
  describe('Error Handling', () => {
    it('should_ThrowContainerError_When_FactoryThrowsError', () => {
      // Given
      const token = Symbol('FailingService');
      container.register(token, () => {
        throw new Error('Factory failed');
      });

      // When & Then
      expect(() => container.resolve(token)).toThrow(ContainerError);
      try {
        container.resolve(token);
      } catch (error) {
        expect((error as ContainerError).message).toContain('Factory failed');
      }
    });

    it('should_HandleNonErrorThrows_When_FactoryThrowsNonError', () => {
      // Given
      const token = Symbol('StringThrowingService');
      container.register(token, () => {
        throw 'String error';
      });

      // When & Then
      expect(() => container.resolve(token)).toThrow(ContainerError);
      try {
        container.resolve(token);
      } catch (error) {
        expect((error as ContainerError).message).toContain('String error');
      }
    });

    it('should_HandleObjectThrows_When_FactoryThrowsObject', () => {
      // Given
      const token = Symbol('ObjectThrowingService');
      container.register(token, () => {
        throw { code: 'ERR', message: 'Object error' };
      });

      // When & Then
      expect(() => container.resolve(token)).toThrow(ContainerError);
      try {
        container.resolve(token);
      } catch (error) {
        expect((error as ContainerError).message).toContain('[object Object]');
      }
    });

    it('should_CleanupResolutionStack_When_ErrorOccurs', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');

      container.register(tokenA, c => {
        c.resolve(tokenB);
        return {};
      });
      container.register(tokenB, () => {
        throw new Error('Service B failed');
      });

      // When
      try {
        container.resolve(tokenA);
      } catch {
        // Ignore error
      }

      // Then - Should be able to resolve other services without issues
      const tokenC = Symbol('ServiceC');
      container.register(tokenC, () => ({ value: 'ok' }));
      expect(() => container.resolve(tokenC)).not.toThrow();
    });

    it('should_PreserveCircularDependencyError_When_ThrowingCircularError', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      container.register(tokenA, c => {
        c.resolve(tokenA);
        return {};
      });

      // When & Then
      expect(() => container.resolve(tokenA)).toThrow(CircularDependencyError);
      try {
        container.resolve(tokenA);
      } catch (error) {
        if (error instanceof CircularDependencyError) {
          expect(error).toBeInstanceOf(CircularDependencyError);
          expect(error).toBeInstanceOf(ContainerError);
          expect(error.constructor).not.toBe(ContainerError);
        } else {
          fail(`Expected CircularDependencyError, got ${error?.constructor?.name || typeof error}`);
        }
      }
    });
  });
  describe('isRegistered', () => {
    it('should_ReturnTrue_When_TokenIsRegistered', () => {
      // Given
      const token = Symbol('RegisteredService');
      container.register(token, () => ({}));

      // When
      const result = container.isRegistered(token);

      // Then
      expect(result).toBe(true);
    });

    it('should_ReturnFalse_When_TokenIsNotRegistered', () => {
      // Given
      const token = Symbol('UnregisteredService');

      // When
      const result = container.isRegistered(token);

      // Then
      expect(result).toBe(false);
    });

    it('should_ReturnTrue_When_SingletonIsRegistered', () => {
      // Given
      const token = Symbol('SingletonService');
      container.registerSingleton(token, () => ({}));

      // When
      const result = container.isRegistered(token);

      // Then
      expect(result).toBe(true);
    });

    it('should_ReturnTrue_When_InstanceIsRegistered', () => {
      // Given
      const token = Symbol('InstanceService');
      container.registerInstance(token, {});

      // When
      const result = container.isRegistered(token);

      // Then
      expect(result).toBe(true);
    });
  });
  describe('registerInstance - Internal Factory Coverage', () => {
    it('should_StoreLambdaFactoryReturningInstance_When_RegisterInstanceCalled', () => {
      // Given
      const token = Symbol('TestInstance');
      const instance = { test: 'value' };

      // When
      container.registerInstance(token, instance);

      // Access private services map via type assertion for testing
      const privateContainer = container as any;
      const registration = privateContainer.services.get(token);

      // Then
      expect(registration).toBeDefined();
      expect(registration.lifecycle).toBe('singleton');
      expect(registration.instance).toBe(instance);
      expect(typeof registration.factory).toBe('function');

      // Execute the factory directly to cover line 91
      const factoryResult = registration.factory();
      expect(factoryResult).toBe(instance);
    });
  });
  describe('Resolution Stack Cleanup - Finally Block', () => {
    it('should_CleanupResolutionStack_When_FactoryThrowsError', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');

      let resolutionAttempts = 0;

      container.register(tokenA, () => {
        resolutionAttempts++;
        throw new Error('Service A always fails');
      });

      container.register(tokenB, () => ({ value: 'B works' }));

      // When - First resolution fails
      try {
        container.resolve(tokenA);
      } catch (error) {
        expect(error).toBeInstanceOf(ContainerError);
      }

      // Then - Stack should be cleaned up, allowing subsequent resolutions
      expect(() => container.resolve(tokenB)).not.toThrow();
      expect(container.resolve<{ value: string }>(tokenB).value).toBe('B works');

      // When - Try to resolve failing service again
      try {
        container.resolve(tokenA);
      } catch (error) {
        expect(error).toBeInstanceOf(ContainerError);
      }

      // Then - Should have attempted twice (stack was cleaned each time)
      expect(resolutionAttempts).toBe(2);
    });

    it('should_CleanupResolutionStack_When_CircularDependencyDetected', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');
      const tokenC = Symbol('ServiceC');

      container.register(tokenA, c => {
        c.resolve(tokenB);
        return { name: 'A' };
      });

      container.register(tokenB, c => {
        c.resolve(tokenA); // Circular dependency
        return { name: 'B' };
      });

      container.register(tokenC, () => ({ name: 'C' }));

      // When - Circular dependency throws
      try {
        container.resolve(tokenA);
      } catch (error) {
        expect(error).toBeInstanceOf(CircularDependencyError);
      }

      // Then - Stack should be cleaned, allowing other resolutions
      expect(() => container.resolve(tokenC)).not.toThrow();
      expect(container.resolve<{ name: string }>(tokenC).name).toBe('C');
    });

    it('should_CleanupStackAtEachLevel_When_NestedResolutionsFail', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');
      const tokenC = Symbol('ServiceC');
      const tokenD = Symbol('ServiceD');

      // A -> B -> C -> D (D fails)
      container.register(tokenD, () => {
        throw new Error('D fails');
      });

      container.register(tokenC, c => {
        c.resolve(tokenD); // This will fail
        return { name: 'C' };
      });

      container.register(tokenB, c => {
        c.resolve(tokenC); // This will fail due to C -> D failure
        return { name: 'B' };
      });

      container.register(tokenA, c => {
        c.resolve(tokenB); // This will fail due to B -> C -> D failure
        return { name: 'A' };
      });

      // When - Resolution fails at deepest level
      try {
        container.resolve(tokenA);
      } catch (error) {
        expect(error).toBeInstanceOf(ContainerError);
        expect((error as ContainerError).message).toContain('D fails');
      }

      // Then - Stack should be completely cleaned
      // Register a new simple service and verify it resolves
      const tokenE = Symbol('ServiceE');
      container.register(tokenE, () => ({ name: 'E' }));

      expect(() => container.resolve(tokenE)).not.toThrow();
      expect(container.resolve<{ name: string }>(tokenE).name).toBe('E');
    });

    it('should_MaintainStackIntegrity_When_MultipleErrorsOccur', () => {
      // Given
      const failingToken1 = Symbol('FailingService1');
      const failingToken2 = Symbol('FailingService2');
      const workingToken = Symbol('WorkingService');

      container.register(failingToken1, () => {
        throw new Error('Error 1');
      });

      container.register(failingToken2, () => {
        throw new Error('Error 2');
      });

      container.register(workingToken, () => ({ value: 'works' }));

      // When - Multiple errors occur
      expect(() => container.resolve(failingToken1)).toThrow(ContainerError);
      expect(() => container.resolve(failingToken2)).toThrow(ContainerError);
      expect(() => container.resolve(failingToken1)).toThrow(ContainerError);

      // Then - Working service still resolves correctly
      expect(() => container.resolve(workingToken)).not.toThrow();
      expect(container.resolve<{ value: string }>(workingToken).value).toBe('works');
    });

    it('should_CleanupStack_When_NonErrorObjectThrown', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');

      container.register(tokenA, () => {
        throw 'String error'; // Non-Error object
      });

      container.register(tokenB, () => ({ value: 'B' }));

      // When - Non-Error thrown
      try {
        container.resolve(tokenA);
      } catch (error) {
        expect(error).toBeInstanceOf(ContainerError);
      }

      // Then - Stack cleaned, other services work
      expect(() => container.resolve(tokenB)).not.toThrow();
    });

    it('should_CleanupStackCorrectly_When_PartialResolutionSucceeds', () => {
      // Given
      const tokenA = Symbol('ServiceA');
      const tokenB = Symbol('ServiceB');
      const tokenC = Symbol('ServiceC');

      let bResolutionCount = 0;

      // A depends on B and C, but C fails
      container.registerSingleton(tokenB, () => {
        bResolutionCount++;
        return { name: 'B' };
      });

      container.register(tokenC, () => {
        throw new Error('C fails');
      });

      container.register(tokenA, c => {
        const b = c.resolve(tokenB); // This succeeds
        const cc = c.resolve(tokenC); // This fails
        return { b, c: cc };
      });

      // When - A fails due to C, but B was successfully resolved
      try {
        container.resolve(tokenA);
      } catch (error) {
        expect(error).toBeInstanceOf(ContainerError);
      }

      // Then - B singleton should be cached despite A's failure
      const directB = container.resolve<{ name: string }>(tokenB);
      expect(directB.name).toBe('B');
      expect(bResolutionCount).toBe(1); // B was only created once

      // Stack should be clean
      const tokenD = Symbol('ServiceD');
      container.register(tokenD, () => ({ name: 'D' }));
      expect(() => container.resolve(tokenD)).not.toThrow();
    });
  });
});
