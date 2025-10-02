import { Request, Response } from 'express';

import { Config } from '@/config';
import { Container, TOKENS } from '@/container';
import { HealthController, ClockService, UuidService, WinstonLoggerService } from '@/infrastructure';

describe('HealthController - Integration Tests', () => {
  let controller: HealthController;
  let container: Container;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;
  let statusCode: number;

  beforeEach(() => {
    // Real implementations
    container = new Container();
    const config = Config.getConfig();
    const clock = new ClockService();
    const uuid = new UuidService();
    const logger = new WinstonLoggerService(config, clock);

    // Register critical services
    container.registerInstance(TOKENS.Config, config);
    container.registerInstance(TOKENS.Logger, logger);
    container.registerInstance(TOKENS.Clock, clock);
    container.registerInstance(TOKENS.Uuid, uuid);

    controller = new HealthController(container, config, logger, uuid, clock);

    // Mock only Express interfaces
    mockRequest = {
      requestId: 'test-request-123',
    };

    responseData = null;
    statusCode = 0;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(data => {
        responseData = data;
        return mockResponse as Response;
      }),
    };

    (mockResponse.status as jest.Mock).mockImplementation((code: number) => {
      statusCode = code;
      return mockResponse;
    });
  });

  afterEach(() => {
    Config.resetInstance();
  });

  describe('getHealth - Basic Health Check', () => {
    it('should_Return200WithHealthyStatus_When_AllServicesOperational', async () => {
      await controller.getHealth(mockRequest as Request, mockResponse as Response);

      expect(statusCode).toBe(200);
      expect(responseData).toMatchObject({
        status: 'healthy',
        service: expect.any(String),
        version: expect.any(String),
        uptime: expect.any(Number),
        requestId: 'test-request-123',
        environment: expect.any(String),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      });
    });

    it('should_GenerateRequestId_When_NotProvidedInRequest', async () => {
      delete mockRequest.requestId;

      await controller.getHealth(mockRequest as Request, mockResponse as Response);

      expect(statusCode).toBe(200);
      expect(responseData.requestId).toBeDefined();
      expect(typeof responseData.requestId).toBe('string');
      expect(responseData.requestId.length).toBeGreaterThan(0);
    });

    it('should_IncludePositiveUptime_When_ServiceRunning', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));

      await controller.getHealth(mockRequest as Request, mockResponse as Response);

      expect(responseData.uptime).toBeGreaterThan(0);
    });
  });

  describe('getDeepHealth - Deep Health Check', () => {
    it('should_Return200WithHealthyDependencies_When_AllServicesRegistered', async () => {
      await controller.getDeepHealth(mockRequest as Request, mockResponse as Response);

      expect(statusCode).toBe(200);
      expect(responseData.status).toBe('healthy');
      expect(responseData.dependencies).toBeDefined();

      const dependencyNames = Object.keys(responseData.dependencies);
      expect(dependencyNames).toContain('Config');
      expect(dependencyNames).toContain('Logger');
      expect(dependencyNames).toContain('Clock');
      expect(dependencyNames).toContain('Uuid');
    });

    it('should_IncludeSystemMetrics_When_DeepHealthExecuted', async () => {
      await controller.getDeepHealth(mockRequest as Request, mockResponse as Response);

      const { system } = responseData;

      expect(system.memory).toBeDefined();
      expect(system.memory.total).toBeGreaterThan(0);
      expect(system.memory.used).toBeGreaterThan(0);
      expect(system.memory.free).toBeGreaterThan(0);
      expect(system.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(system.memory.percentage).toBeLessThanOrEqual(100);
      expect(system.uptime).toBeGreaterThan(0);
    });

    it('should_Return503WithUnhealthyStatus_When_CriticalServiceMissing', async () => {
      // Create empty container without services
      const emptyContainer = new Container();
      const config = Config.getConfig();
      const clock = new ClockService();
      const uuid = new UuidService();
      const logger = new WinstonLoggerService(config, clock);

      const faultyController = new HealthController(emptyContainer, config, logger, uuid, clock);

      await faultyController.getDeepHealth(mockRequest as Request, mockResponse as Response);

      expect(statusCode).toBe(503);
      expect(responseData.status).toBe('unhealthy');

      // Verify dependencies are marked unhealthy
      const deps = responseData.dependencies;
      Object.values(deps).forEach((dep: any) => {
        expect(dep.status).toBe('unhealthy');
      });
    });

    it('should_IncludeDependencyResponseTimes_When_CheckingServices', async () => {
      await controller.getDeepHealth(mockRequest as Request, mockResponse as Response);

      const dependencies = responseData.dependencies;

      Object.entries(dependencies).forEach(([_name, dep]: [string, any]) => {
        expect(dep).toMatchObject({
          status: expect.stringMatching(/^(healthy|unhealthy|degraded)$/),
          message: expect.any(String),
          responseTime: expect.any(Number),
        });
        expect(dep.responseTime).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
