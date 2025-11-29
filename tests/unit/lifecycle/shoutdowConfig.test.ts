/* eslint-disable @typescript-eslint/no-require-imports */
import { configureShutdown } from '@/infrastructure/lifecycle/shutdownConfig';
import { GracefulShutdown } from '@/infrastructure/lifecycle/shutdown';
import { IContainer, ILogger, IHttpServer } from '@/interfaces';

// Mock implementations
const mockHttpServer = {
  stop: jest.fn(),
  start: jest.fn(),
  isRunning: jest.fn(),
  getApp: jest.fn(),
  getServerInfo: jest.fn(),
} as unknown as IHttpServer;

let mockGracefulShutdown = {
  registerCleanup: jest.fn(),
  shutDown: jest.fn(),
  registerCleanupsCount: 0,
} as unknown as GracefulShutdown;

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
} as unknown as ILogger;

const mockContainer = {
  resolve: jest.fn(),
} as unknown as IContainer;

const mockWrappedContainer = {
  resolve: jest.fn(),
} as unknown as IContainer;

// Mock the wrapContainerLogger and getErrorMessage functions
jest.mock('@/shared', () => ({
  wrapContainerLogger: jest.fn(),
  getErrMsg: jest.fn(error => error.message || String(error)),
}));

describe('Shutdown Configuration', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Ensure graceful shutdown mock exposes registerCleanup as a jest.fn()
    mockGracefulShutdown = {
      registerCleanup: jest.fn(),
      shutDown: jest.fn().mockResolvedValue(undefined),
      performShutdown: jest.fn().mockResolvedValue(undefined),
      logger: mockLogger,
    } as unknown as GracefulShutdown;

    // Setup mock implementations
    const { wrapContainerLogger } = require('@/shared');
    wrapContainerLogger.mockReturnValue(mockWrappedContainer);

    mockWrappedContainer.resolve = jest.fn().mockImplementation((service: string) => {
      switch (service) {
        case 'GracefulShutdown':
          return mockGracefulShutdown;
        case 'Logger':
          return mockLogger;
        default:
          return {};
      }
    });

    mockContainer.resolve = jest.fn().mockImplementation((service: string) => {
      switch (service) {
        case 'HttpServer':
          return mockHttpServer;
        default:
          return {};
      }
    });

    mockHttpServer.stop = jest.fn().mockResolvedValue(undefined);
  });

  it('should configure graceful shutdown with container context', () => {
    const { wrapContainerLogger } = require('@/shared');

    const result = configureShutdown(mockContainer);

    expect(wrapContainerLogger).toHaveBeenCalledWith(mockContainer, 'configureShutdown');
    expect(mockWrappedContainer.resolve).toHaveBeenCalledWith('GracefulShutdown');
    expect(mockWrappedContainer.resolve).toHaveBeenCalledWith('Logger');
    expect(result).toBe(mockGracefulShutdown);
  });

  it('should register HTTP Server cleanup function', async () => {
    configureShutdown(mockContainer);

    // Esperar un tick si configureShutdown registra asíncronamente
    await new Promise(r => setImmediate(r));

    // Verificar que registerCleanup fue llamada
    expect(mockGracefulShutdown.registerCleanup).toHaveBeenCalledTimes(2);

    // Obtener la función registrada — casteamos a jest.Mock para acceder a .mock
    const cleanupFunction = (mockGracefulShutdown.registerCleanup as unknown as jest.Mock).mock.calls[0][0];
    expect(typeof cleanupFunction).toBe('function');

    // Ejecutar la cleanup function
    await cleanupFunction();

    expect(mockLogger.debug).toHaveBeenCalledWith('Closing Http Server');
    expect(mockContainer.resolve).toHaveBeenCalledWith('HttpServer');
    expect(mockHttpServer.stop).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('Http Server closed');
  });
  it('should handle HTTP Server cleanup errors gracefully', async () => {
    const shutdownError = new Error('Failed to close server');
    mockHttpServer.stop = jest.fn().mockRejectedValue(shutdownError);

    configureShutdown(mockContainer);

    // Esperar un tick si configureShutdown registra asíncronamente
    await new Promise(r => setImmediate(r));

    // Get and execute the cleanup function
    const cleanupFunction = (mockGracefulShutdown.registerCleanup as unknown as jest.Mock).mock.calls[0][0];

    await expect(cleanupFunction()).rejects.toThrow('Failed to close server');

    expect(mockLogger.error).toHaveBeenCalledWith('Failed to stop Http Server', { error: 'Failed to close server' });
  });

  it('should handle missing HTTP Server gracefully', async () => {
    // Test with null HTTP Server
    mockContainer.resolve = jest.fn().mockImplementation((service: string) => {
      if (service === 'HttpServer') return null;
      return {};
    });

    configureShutdown(mockContainer);

    const cleanupFunction = (mockGracefulShutdown.registerCleanup as unknown as jest.Mock).mock.calls[0][0];

    // Should not throw error when httpServer is null
    await expect(cleanupFunction()).resolves.toBeUndefined();
    expect(mockHttpServer.stop).not.toHaveBeenCalled();

    // Test with HTTP Server without stop method
    mockContainer.resolve = jest.fn().mockImplementation((service: string) => {
      if (service === 'HttpServer') return { someOtherMethod: jest.fn() };
      return {};
    });

    configureShutdown(mockContainer);
    const cleanupFunction2 = (mockGracefulShutdown.registerCleanup as unknown as jest.Mock).mock.calls[1][0];

    await expect(cleanupFunction2()).resolves.toBeUndefined();
  });

  it('should log configuration completion with cleanup count', () => {
    // Set a specific cleanup count for testing
    Object.defineProperty(mockGracefulShutdown, 'registerCleanupsCount', {
      value: 1,
      writable: true,
    });

    configureShutdown(mockContainer);

    expect(mockLogger.debug).toHaveBeenCalledWith('Graceful shutdown configured', { requestCleanups: 1 });
  });
});
