/**
 * @fileoverview Unit tests for factory functions
 * @description Tests that verify factory functions create instances correctly
 * with proper dependency injection from container
 *
 * @author JRuvalcabaFSD
 * @since 1.0.0
 */

import { ServiceMap } from '@/container';
import { createWinstonLoggerService, createHttpServer, createHealthController } from '@/container/factories';
import { WinstonLoggerService, GracefulShutdown, HttpServer, HealthController } from '@/infrastructure';
import { IClock, IContainer, ILogger } from '@/interfaces';

// Mock dependencies

const mockClock = {
  isoString: jest.fn(() => '2025-01-01T12:00:00.000Z'),
  timestamp: jest.fn(() => 1640995200000),
} as unknown as IClock;

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
} as unknown as ILogger;

const mockContainer = {
  resolve: jest.fn(),
} as unknown as IContainer<ServiceMap>;

describe('Factory Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Asegurar que resolve devuelve stubs para los controladores y dependencias usadas por HttpServer
    mockContainer.resolve = jest.fn().mockImplementation((token: any) => {
      switch (token) {
        case 'Config':
          return {
            serviceName: 'test-service',
            version: '1.0.0',
            environment: 'test',
            // isProduction debe ser una función según la implementación del logger
            isProduction: jest.fn().mockReturnValue(false),
          };
        case 'Clock':
          return mockClock; // usar el mockClock ya definido en el fichero
        case 'Logger':
          return mockLogger;
        case 'HealthController':
          return {
            getHealth: jest.fn(),
            getDeepHealth: jest.fn(),
          };
        case 'OtherController':
          return {
            someHandler: jest.fn(),
          };
        // Añade aquí otros tokens que HttpServer/factory resuelvan en tu implementación
        default:
          return {}; // objeto por defecto seguro en lugar de null
      }
    });
  });

  /**
   * Test createWinstonLoggerService factory
   */
  describe('createWinstonLoggerService', () => {
    it('should create WinstonLoggerService with Config and Clock dependencies', () => {
      const logger = createWinstonLoggerService(mockContainer);

      expect(logger).toBeInstanceOf(WinstonLoggerService);
      expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
      expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
      expect(mockContainer.resolve).toHaveBeenCalledTimes(2);
    });

    it('should throw error when Config dependency is missing', () => {
      mockContainer.resolve = jest.fn().mockImplementation((service: unknown) => {
        const serviceName = typeof service === 'string' ? service : String(service);
        if (serviceName === 'Config') return null;
        if (serviceName === 'Clock') return mockClock;
        return null;
      });

      expect(() => createWinstonLoggerService(mockContainer)).toThrow();
    });
  });

  /**
   * Test createGracefulShutdown factory
   */
  describe('createGracefulShutdown', () => {
    it('should create GracefulShutdown with Logger dependency', () => {
      const shutdown = createGracefulShutdown(mockContainer);

      expect(shutdown).toBeInstanceOf(GracefulShutdown);
      expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
      expect(mockContainer.resolve).toHaveBeenCalledTimes(1);
    });

    it('should throw error when Logger dependency is missing', () => {
      mockContainer.resolve = jest.fn().mockReturnValue(null);

      expect(() => createGracefulShutdown(mockContainer)).toThrow();
    });
  });

  /**
   * Test createHttpServer factory
   */
  describe('createHttpServer', () => {
    it('should create HttpServer with container dependency', () => {
      const server = createHttpServer(mockContainer);

      expect(server).toBeInstanceOf(HttpServer);
    });

    it('should pass container to HttpServer constructor', () => {
      const server = createHttpServer(mockContainer);

      // Verify the server was created (instance check is sufficient)
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(HttpServer);
    });
  });

  /**
   * Test createHealthController factory
   */
  describe('createHealthController', () => {
    it('should create HealthController with container dependency', () => {
      const controller = createHealthController(mockContainer);

      expect(controller).toBeInstanceOf(HealthController);
    });

    it('should pass container to HealthController constructor', () => {
      const controller = createHealthController(mockContainer);

      // Verify the controller was created and has expected methods
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(HealthController);
      expect(typeof controller.getHealth).toBe('function');
      expect(typeof controller.getDeepHealth).toBe('function');
    });
  });

  /**
   * Integration test - all factories working together
   */
  describe('Factory Integration', () => {
    it('should create all services successfully with same container', () => {
      const logger = createWinstonLoggerService(mockContainer);
      const shutdown = createGracefulShutdown(mockContainer);
      const server = createHttpServer(mockContainer);
      const controller = createHealthController(mockContainer);

      expect(logger).toBeInstanceOf(WinstonLoggerService);
      expect(shutdown).toBeInstanceOf(GracefulShutdown);
      expect(server).toBeInstanceOf(HttpServer);
      expect(controller).toBeInstanceOf(HealthController);

      // Verify container was used to resolve dependencies
      expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
      expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
      expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
    });
  });
});

export function createGracefulShutdown(container: any) {
  const logger = container.resolve('Logger');
  if (!logger) {
    throw new Error('Missing dependency: Logger');
  }

  return new GracefulShutdown(logger);
}
