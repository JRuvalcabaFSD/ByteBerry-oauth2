/* eslint-disable @typescript-eslint/no-require-imports */
import { Request, Response } from 'express';
let HealthControllerClass: any;
import { IContainer, IConfig, IClock, IUuid, ILogger } from '@/interfaces';
import { ServiceMap } from '@/container';

jest.mock('os', () => ({
  totalmem: jest.fn(() => 8589934592),
  freemem: jest.fn(() => 2147483648),
  uptime: jest.fn(() => 86400),
}));

const mockConfig = {
  serviceName: 'test-service',
  version: '1.0.0',
  nodeEnv: 'test',
} as IConfig;

const mockClock = {
  isoString: jest.fn(() => '2025-01-01T12:00:00.000Z'),
  timestamp: jest.fn(() => 1640995200000),
} as unknown as IClock;

const mockUuid = {
  generate: jest.fn(() => 'test-uuid-123'),
} as unknown as IUuid;

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
} as unknown as ILogger;

const mockContainer = {
  resolve: jest.fn(),
} as unknown as IContainer<ServiceMap>;

const mockRequest = {
  requestId: undefined,
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

jest.mock('@/shared', () => ({
  getErrorMessage: jest.fn(error => error.message || String(error)),
  withLoggerContext: jest.fn((logger, _context) => ({
    ...logger,
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

jest.mock('@/container', () => ({
  criticalServices: ['Database', 'Redis', 'HttpServer'],
}));

describe('HealthController - Complete Coverage', () => {
  let healthController: any;
  let mockContextLogger: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockClock.isoString = jest.fn(() => '2025-01-01T12:00:00.000Z');
    mockClock.timestamp = jest.fn(() => 1640995200000);
    mockUuid.generate = jest.fn(() => 'test-uuid-123');

    const { withLoggerContext } = require('@/shared');
    mockContextLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    withLoggerContext.mockReturnValue(mockContextLogger);

    mockContainer.resolve = jest.fn().mockImplementation((service?: unknown) => {
      const name = typeof service === 'string' ? service : '';
      switch (name) {
        case 'Config':
          return mockConfig;
        case 'Clock':
          return mockClock;
        case 'Uuid':
          return mockUuid;
        case 'Logger':
          return mockLogger;
        default:
          return null;
      }
    });

    const mod = await import('@/infrastructure/controllers/health.controller');
    HealthControllerClass = mod.HealthController;
    healthController = new HealthControllerClass(mockContainer);
  });

  it('should return healthy response for basic health check', async () => {
    mockRequest.requestId = 'existing-request-id';

    await healthController.getHealth(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'healthy',
      timestamp: '2025-01-01T12:00:00.000Z',
      service: 'test-service',
      version: '1.0.0',
      uptime: expect.any(Number),
      requestId: 'existing-request-id',
      environment: 'test',
    });
  });

  it('should return healthy response for deep health check', async () => {
    mockContainer.resolve = jest.fn().mockImplementation((service?: unknown) => {
      const name = typeof service === 'string' ? service : '';
      switch (name) {
        case 'Config':
          return mockConfig;
        case 'Clock':
          return mockClock;
        case 'Uuid':
          return mockUuid;
        case 'Logger':
          return mockLogger;
        case 'Database':
          return { connected: true };
        case 'Redis':
          return { status: 'ready' };
        case 'HttpServer':
          return { running: true };
        default:
          return { service: 'mock' };
      }
    });

    await healthController.getDeepHealth(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        dependencies: expect.objectContaining({
          Database: expect.objectContaining({
            status: 'healthy',
            message: 'Database service is available and operational',
          }),
          Redis: expect.objectContaining({
            status: 'healthy',
            message: 'Redis service is available and operational',
          }),
          HttpServer: expect.objectContaining({
            status: 'healthy',
            message: 'HttpServer service is available and operational',
          }),
        }),
        system: expect.objectContaining({
          memory: expect.objectContaining({
            used: expect.any(Number),
            free: expect.any(Number),
            total: expect.any(Number),
            percentage: expect.any(Number),
          }),
          uptime: expect.any(Number),
        }),
      })
    );
  });

  it('should return unhealthy response when dependencies fail', async () => {
    mockContainer.resolve = jest.fn().mockImplementation((service?: unknown) => {
      const name = typeof service === 'string' ? service : '';
      switch (name) {
        case 'Config':
          return mockConfig;
        case 'Clock':
          return mockClock;
        case 'Uuid':
          return mockUuid;
        case 'Logger':
          return mockLogger;
        case 'Database':
          throw new Error('Database connection failed');
        case 'Redis':
          return null;
        case 'HttpServer':
          return { running: true };
        default:
          return null;
      }
    });

    await healthController.getDeepHealth(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unhealthy',
        dependencies: expect.objectContaining({
          Database: expect.objectContaining({
            status: 'unhealthy',
            message: 'Database service check failed: Database connection failed',
          }),
          Redis: expect.objectContaining({
            status: 'unhealthy',
            message: 'Redis service resolved to null/undefined',
          }),
        }),
      })
    );
  });

  it('should handle container with isRegistered method', async () => {
    (mockContainer as any).isRegistered = jest.fn().mockImplementation((service: unknown) => {
      const name = typeof service === 'string' ? service : '';
      return name !== 'Database';
    });

    mockContainer.resolve = jest.fn().mockImplementation((service?: unknown) => {
      const name = typeof service === 'string' ? service : '';
      switch (name) {
        case 'Config':
          return mockConfig;
        case 'Clock':
          return mockClock;
        case 'Uuid':
          return mockUuid;
        case 'Logger':
          return mockLogger;
        case 'Redis':
          return { status: 'ready' };
        case 'HttpServer':
          return { running: true };
        default:
          return null;
      }
    });

    await healthController.getDeepHealth(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unhealthy',
        dependencies: expect.objectContaining({
          Database: expect.objectContaining({
            status: 'unhealthy',
            message: 'Database service is not registered in container',
          }),
        }),
      })
    );
  });

  it('should handle basic health check error', async () => {
    const testError = new Error('Clock service failed');

    delete (mockRequest as any).requestId;

    mockClock.isoString = jest.fn().mockImplementation(() => {
      throw testError;
    });

    jest.spyOn(healthController, 'handleHealthError').mockResolvedValue(undefined);

    await healthController.getHealth(mockRequest, mockResponse);

    expect(mockContextLogger.error).toHaveBeenCalledWith('Health check failed', {
      error: 'Clock service failed',
      requestId: 'test-uuid-123',
    });

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'unhealthy',
      timestamp: expect.any(String),
      service: 'test-service',
      requestId: 'test-uuid-123',
      error: 'Clock service failed',
    });
  });

  it('should handle deep health check error', async () => {
    const testError = new Error('Dependencies check failed');
    mockClock.timestamp = jest.fn().mockImplementation(() => {
      throw testError;
    });

    jest.spyOn(healthController, 'handleHealthError').mockResolvedValue(undefined);

    await healthController.getDeepHealth(mockRequest, mockResponse);

    expect(healthController.handleHealthError).toHaveBeenCalledWith(mockRequest, mockResponse, testError, 'basic');
  });

  it('should use fallback in handleHealthError when services fail', async () => {
    const error = new Error('Test error');

    const failingContainer = {
      resolve: jest.fn().mockImplementation((service?: unknown) => {
        const name = typeof service === 'string' ? service : '';
        switch (name) {
          case 'Config':
            return {
              serviceName: 'test-service',
              version: '0.0.0',
              environment: 'test',
            };
          case 'Clock':
            return {
              isoString: () => {
                throw new Error('Clock failed');
              },
            };
          case 'Uuid':
            return {
              generate: () => {
                throw new Error('UUID failed');
              },
            };
          case 'Logger':
            return {
              error: () => {
                throw new Error('Logger failed');
              },
            };
          default:
            return null;
        }
      }),
    } as unknown as IContainer<ServiceMap>;

    const failingController = new HealthControllerClass(failingContainer);

    await failingController.handleHealthError(mockRequest, mockResponse, error, 'deep');

    expect(mockResponse.status).toHaveBeenCalledWith(503);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'unhealthy',
      timestamp: expect.any(String),
      service: undefined,
      version: '0.0.0',
      uptime: 0,
      error: 'Health check system failure',
    });
  });

  it('should handle registered service that resolves to exactly null', async () => {
    (mockContainer as any).isRegistered = jest.fn().mockReturnValue(true);

    mockContainer.resolve = jest.fn().mockImplementation((service?: unknown) => {
      const name = typeof service === 'string' ? service : '';
      switch (name) {
        case 'Config':
          return mockConfig;
        case 'Clock':
          return mockClock;
        case 'Uuid':
          return mockUuid;
        case 'Logger':
          return mockLogger;
        case 'Database':
          return null;
        default:
          return { service: 'mock' };
      }
    });

    await healthController.getDeepHealth(mockRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        dependencies: expect.objectContaining({
          Database: expect.objectContaining({
            status: 'unhealthy',
            message: 'Database service resolved to null/undefined',
          }),
        }),
      })
    );
  });
  it('should return degraded status when some dependencies are not healthy or unhealthy', async () => {
    const mixedDependencies = {
      Database: { status: 'warning', message: 'test', responseTime: 100 },
      Redis: { status: 'healthy', message: 'test', responseTime: 50 },
    };

    const status = healthController.determineOverallStatus(mixedDependencies);
    expect(status).toBe('degraded');
  });
});
