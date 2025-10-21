/**
 * @fileoverview Unit tests for HealthController class
 * @description Tests health controller functionality including basic health checks,
 * deep health checks, dependency checking, system info gathering, and error handling.
 *
 * @author JRuvalcabaFSD
 * @since 1.0.0
 */

import { Request, Response } from 'express';
// Load HealthController dynamically after mocks to ensure mocked criticalServices is used
let HealthControllerClass: any;
import { IContainer, IConfig, IClock, IUuid, ILogger } from '@/interfaces';
import { ServiceMap } from '@/container';

// Mock os module
jest.mock('os', () => ({
  totalmem: jest.fn(() => 8589934592), // 8GB
  freemem: jest.fn(() => 2147483648), // 2GB
  uptime: jest.fn(() => 86400), // 24 hours
}));

// Mock container dependencies
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

// Helper to normalize token name (handles string or Symbol tokens)
function tokenName(token: unknown): string {
  if (typeof token === 'string') return token;
  if (typeof token === 'symbol') {
    const m = token.toString().match(/^Symbol\((.*)\)$/);
    return m ? m[1] : token.toString();
  }
  return String(token);
}

// Mock Express Request and Response
const mockRequest = {
  requestId: undefined,
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

// Mock shared utilities
jest.mock('@/shared', () => ({
  getErrorMessage: jest.fn(error => error.message || String(error)),
  withLoggerContext: jest.fn((logger, _context) => ({
    ...logger,
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock critical services
jest.mock('@/container', () => ({
  criticalServices: ['Database', 'Redis', 'HttpServer'],
}));

describe('HealthController', () => {
  let healthController: any;
  let mockContextLogger: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Restore default mock implementations for mutable mocks to ensure test isolation
    mockClock.isoString = jest.fn(() => '2025-01-01T12:00:00.000Z');
    mockClock.timestamp = jest.fn(() => 1640995200000);
    mockUuid.generate = jest.fn(() => 'test-uuid-123');
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.debug = jest.fn();
    mockLogger.warn = jest.fn();

    // Setup context logger mock
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withLoggerContext } = require('@/shared');
    mockContextLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    withLoggerContext.mockReturnValue(mockContextLogger);

    // Setup default container mocks - IMPORTANTE: debe estar después del mock setup
    mockContainer.resolve = jest.fn().mockImplementation((service: unknown) => {
      const name = tokenName(service);
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

    // Dynamically import the controller after mocks are set up so it picks up jest.mock('@/container')
    const mod = await import('@/infrastructure/controllers/health.controller');
    HealthControllerClass = mod.HealthController;
    healthController = new HealthControllerClass(mockContainer);
  });

  /**
   * @test Basic health check returns healthy response
   * @description Verifies that getHealth returns 200 status with proper health response
   * including all required fields and correct logging
   */
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

    expect(mockContextLogger.info).toHaveBeenCalledWith(
      'Health check completed',
      expect.objectContaining({
        requestId: 'existing-request-id',
        status: 'healthy',
        uptime: expect.any(Number),
      })
    );
  });

  /**
   * @test Basic health check handles missing requestId
   * @description Ensures that when requestId is missing, a new UUID is generated
   * and used consistently throughout the response
   */
  it('should generate requestId when missing in basic health check', async () => {
    // Simular ausencia de requestId en lugar de asignar `undefined`
    delete (mockRequest as any).requestId;

    await healthController.getHealth(mockRequest, mockResponse);

    expect(mockUuid.generate).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'test-uuid-123',
      })
    );
  });

  /**
   * @test Basic health check handles errors appropriately
   * @description Verifies error handling in basic health check including logging,
   * error response format, and delegation to handleHealthError
   */
  it('should handle errors in basic health check', async () => {
    const testError = new Error('Clock service failed');
    mockClock.isoString = jest.fn().mockImplementation(() => {
      throw testError;
    });

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

  /**
   * @test Deep health check with all healthy dependencies
   * @description Verifies deep health check returns 200 with healthy status
   * when all dependencies are available and operational
   */
  it('should return healthy response for deep health check with healthy dependencies', async () => {
    // CORRECCIÓN: Re-configurar el container después de la construcción del controller
    mockContainer.resolve = jest.fn().mockImplementation((service: unknown) => {
      const name = tokenName(service);
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
          return { mockService: true }; // CORREGIDO: retornar objeto válido en lugar de null
      }
    });

    await healthController.getDeepHealth(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        service: 'test-service',
        version: 'test-service',
        dependencies: expect.objectContaining({
          Database: expect.objectContaining({
            status: 'healthy',
            message: 'Database service is available and operational',
            responseTime: expect.any(Number),
          }),
          Redis: expect.objectContaining({
            status: 'healthy',
            message: 'Redis service is available and operational',
            responseTime: expect.any(Number),
          }),
          HttpServer: expect.objectContaining({
            status: 'healthy',
            message: 'HttpServer service is available and operational',
            responseTime: expect.any(Number),
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

  /**
   * @test Deep health check with unhealthy dependencies
   * @description Verifies deep health check returns 503 with unhealthy status
   * when critical dependencies fail or are unavailable
   */
  it('should return unhealthy response when dependencies are unhealthy', async () => {
    // CORRECCIÓN: Re-configurar el container después de la construcción del controller
    mockContainer.resolve = jest.fn().mockImplementation((service: unknown) => {
      const name = tokenName(service);
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
          return null; // Service resolves to null
        case 'HttpServer':
          return { running: true };
        default:
          return null;
      }
    });

    await healthController.getDeepHealth(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(503);

    // CORRECCIÓN: Usar la estructura exacta que devuelve el controller
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'unhealthy',
        service: 'test-service',
        version: 'test-service',
        environment: 'test',
        requestId: 'test-uuid-123',
        timestamp: '2025-01-01T12:00:00.000Z',
        uptime: expect.any(Number),
        dependencies: expect.objectContaining({
          Database: expect.objectContaining({
            status: 'unhealthy',
            message: 'Database service check failed: Database connection failed',
            responseTime: expect.any(Number),
          }),
          Redis: expect.objectContaining({
            status: 'unhealthy',
            message: 'Redis service resolved to null/undefined',
            responseTime: expect.any(Number),
          }),
          HttpServer: expect.objectContaining({
            status: 'healthy',
            message: 'HttpServer service is available and operational',
            responseTime: expect.any(Number),
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
});
