/**
 * Unit tests for bootstrap.container
 *
 * @description Tests the container bootstrap function that initializes
 * the DI container with core singletons and validates critical services.
 *
 * @author JRuvalcabaFSD
 * @since 1.0.0
 */

import { bootstrapContainer } from '@/container/bootstrap.container';
import { Container, criticalServices, ServiceMap } from '@/container';
import { createConfig } from '@/config';
import { createClockService, createUuidService } from '@/infrastructure';
import { ContainerCreationError } from '@/shared';
import { IContainer } from '@/interfaces';
import { createWinstonLoggerService } from '@/container/factories';

// Mock dependencies
jest.mock('@/config', () => ({
  createConfig: jest.fn(),
}));

jest.mock('@/infrastructure', () => ({
  createUuidService: jest.fn(),
}));

jest.mock('@/container/container', () => ({
  Container: jest.fn().mockImplementation(() => ({
    registerSingleton: jest.fn(),
    isRegistered: jest.fn(),
  })),
}));

jest.mock('@/container/tokens', () => ({
  criticalServices: ['Config', 'Clock', 'Uuid'],
}));

describe('bootstrap.container', () => {
  let mockContainer: jest.Mocked<IContainer<ServiceMap>>;
  let mockContainerClass: jest.MockedClass<typeof Container>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockContainerClass = Container as jest.MockedClass<typeof Container>;

    // Create mock container instance
    mockContainer = {
      registerSingleton: jest.fn(),
      register: jest.fn(),
      registerInstance: jest.fn(),
      resolve: jest.fn(),
      isRegistered: jest.fn(),
    };

    // Make Container constructor return our mock
    mockContainerClass.mockImplementation(() => mockContainer as unknown as Container<ServiceMap>);
  });

  describe('Core Functionality', () => {
    it('should create new container instance when bootstrap called', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      const result = bootstrapContainer();

      // Assert
      expect(mockContainerClass).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockContainer);
    });

    it('should register config singleton when bootstrap called', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Config', createConfig);
    });

    it('should register clock singleton when bootstrap called', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Clock', createClockService);
    });

    it('should register uuid singleton when bootstrap called', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Uuid', createUuidService);
    });

    it('should register all required services when bootstrap called', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.registerSingleton).toHaveBeenCalledTimes(4);
      expect(mockContainer.registerSingleton).toHaveBeenNthCalledWith(1, 'Config', createConfig);
      expect(mockContainer.registerSingleton).toHaveBeenNthCalledWith(2, 'Clock', createClockService);
      expect(mockContainer.registerSingleton).toHaveBeenNthCalledWith(3, 'Uuid', createUuidService);
      expect(mockContainer.registerSingleton).toHaveBeenNthCalledWith(4, 'Logger', createWinstonLoggerService);
    });
  });

  describe('Critical Services Validation', () => {
    it('should validate all critical services when bootstrap called', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      criticalServices.forEach(service => {
        expect(mockContainer.isRegistered).toHaveBeenCalledWith(service);
      });
    });

    it('should check config service when validating critical services', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.isRegistered).toHaveBeenCalledWith('Config');
    });

    it('should check clock service when validating critical services', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.isRegistered).toHaveBeenCalledWith('Clock');
    });

    it('should check uuid service when validating critical services', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.isRegistered).toHaveBeenCalledWith('Uuid');
    });
  });

  describe('Error Handling', () => {
    it('should throw container creation error when config service not registered', () => {
      // Arrange
      mockContainer.isRegistered.mockImplementation(token => token !== 'Config');

      // Act & Assert
      expect(() => bootstrapContainer()).toThrow(ContainerCreationError);
      expect(() => bootstrapContainer()).toThrow('Config service not registered');
    });

    it('should throw container creation error when clock service not registered', () => {
      // Arrange
      mockContainer.isRegistered.mockImplementation(token => token !== 'Clock');

      // Act & Assert
      expect(() => bootstrapContainer()).toThrow(ContainerCreationError);
      expect(() => bootstrapContainer()).toThrow('Clock service not registered');
    });

    it('should throw container creation error when uuid service not registered', () => {
      // Arrange
      mockContainer.isRegistered.mockImplementation(token => token !== 'Uuid');

      // Act & Assert
      expect(() => bootstrapContainer()).toThrow(ContainerCreationError);
      expect(() => bootstrapContainer()).toThrow('Uuid service not registered');
    });

    it('should throw container creation error when multiple critical services not registered', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(false);

      // Act & Assert
      expect(() => bootstrapContainer()).toThrow(ContainerCreationError);
    });

    it('should throw first missing service when multiple critical services not registered', () => {
      // Arrange
      mockContainer.isRegistered.mockImplementation(token => token !== 'Config' && token !== 'Clock');

      // Act & Assert
      expect(() => bootstrapContainer()).toThrow('Config service not registered');
    });
  });

  describe('Registration Order', () => {
    it('should register services before validation when bootstrap called', () => {
      // Arrange
      let registrationCallCount = 0;
      let validationCallCount = 0;

      mockContainer.registerSingleton.mockImplementation(() => {
        registrationCallCount++;
      });

      mockContainer.isRegistered.mockImplementation(() => {
        validationCallCount++;
        // Ensure registrations happened before validations
        expect(registrationCallCount).toBe(4);
        return true;
      });

      // Act
      bootstrapContainer();

      // Assert
      expect(registrationCallCount).toBe(4);
      expect(validationCallCount).toBe(3);
    });

    it('should register in correct order when bootstrap called', () => {
      // Arrange
      const registrationOrder: string[] = [];
      mockContainer.registerSingleton.mockImplementation(token => {
        registrationOrder.push(token);
      });
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(registrationOrder).toEqual(['Config', 'Clock', 'Uuid', 'Logger']);
    });
  });

  describe('Factory Function Integration', () => {
    it('should use create config factory when registering config service', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Config', expect.any(Function));

      // Verify it's the correct factory
      const configCall = (mockContainer.registerSingleton as jest.Mock).mock.calls.find(call => call[0] === 'Config');
      expect(configCall[1]).toBe(createConfig);
    });

    it('should use create uuid service factory when registering uuid service', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Uuid', expect.any(Function));

      // Verify it's the correct factory
      const uuidCall = (mockContainer.registerSingleton as jest.Mock).mock.calls.find(call => call[0] === 'Uuid');
      expect(uuidCall[1]).toBe(createUuidService);
    });
  });

  describe('Return Value', () => {
    it('should return container instance when bootstrap successful', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      const result = bootstrapContainer();

      // Assert
      expect(result).toBe(mockContainer);
      expect(result).toHaveProperty('registerSingleton');
      expect(result).toHaveProperty('register');
      expect(result).toHaveProperty('resolve');
      expect(result).toHaveProperty('isRegistered');
    });

    it('should return functional container when bootstrap successful', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      const result = bootstrapContainer();

      // Assert
      expect(typeof result.registerSingleton).toBe('function');
      expect(typeof result.register).toBe('function');
      expect(typeof result.resolve).toBe('function');
      expect(typeof result.isRegistered).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty critical services when array empty', async () => {
      // Arrange
      jest.doMock('@/container/tokens', () => ({
        criticalServices: [],
      }));

      // Re import to get mocked criticalServices
      jest.resetModules();
      const { bootstrapContainer } = await import('@/container/bootstrap.container');

      mockContainer.isRegistered.mockReturnValue(true);

      // Act & Assert
      expect(() => bootstrapContainer()).not.toThrow();
    });

    it('should not call is registered when critical services empty', async () => {
      // Arrange
      jest.doMock('@/container/tokens', () => ({
        criticalServices: [],
      }));

      // Re import to get mocked criticalServices
      jest.resetModules();
      const { bootstrapContainer } = await import('@/container/bootstrap.container');

      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();

      // Assert
      expect(mockContainer.isRegistered).not.toHaveBeenCalled();
    });
  });

  describe('Integration Behavior', () => {
    it('should create fresh container instance when called multiple times', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      const container1 = bootstrapContainer();
      const container2 = bootstrapContainer();

      // Assert
      expect(mockContainerClass).toHaveBeenCalledTimes(2);
      expect(container1).toBe(mockContainer);
      expect(container2).toBe(mockContainer); // Same mock instance, but created twice
    });

    it('should-register-services-in-each-instance-when-called-multiple-times', () => {
      // Arrange
      mockContainer.isRegistered.mockReturnValue(true);

      // Act
      bootstrapContainer();
      bootstrapContainer();

      // Assert
      expect(mockContainer.registerSingleton).toHaveBeenCalledTimes(8); // 4 services × 2 calls
    });
  });
});
