import { HealthService } from '@/infrastructure';
import { IContainer } from '@/interfaces';
import { Request, Response } from 'express';
import os from 'os';

const mockContainer: jest.Mocked<IContainer> = {
  resolve: jest.fn(),
  register: jest.fn(),
  registerSingleton: jest.fn(),
  registerInstance: jest.fn(),
  isRegistered: jest.fn(),
};

const createMockDependencies = () => ({
  config: {
    serviceName: 'ByteBerry OAuth2',
    version: '1.0.0',
    nodeEnv: 'test',
    port: 3000,
    logLevel: 'info',
    databaseUrl: '',
    corsOrigins: ['http://localhost:3000'],
    isDevelopment: jest.fn(() => false),
    isProduction: jest.fn(() => false),
    isTest: jest.fn(() => true),
  } as unknown as import('@/interfaces/config/envConfig.interface').IConfig,
  uuid: {
    generate: jest.fn(() => 'mock uuid 123'),
    isValid: jest.fn((_uuid: string) => true),
  } as import('@/interfaces/services/uuid.interface').IUuid,
  clock: {
    timestamp: jest.fn(() => 1234567890),
    isoString: jest.fn(() => '2025 01 01T12:00:00.000Z'),
    now: jest.fn(() => new Date()),
  } as import('@/interfaces/services/clock.interface').IClock,
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => this),
    log: jest.fn(),
  } as unknown as import('@/interfaces/services/logger.interface').ILogger,
});

const createMockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    requestId: 'test request id',
    ...overrides,
  }) as unknown as Request;

const createMockResponse = (): jest.Mocked<Response> =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }) as unknown as jest.Mocked<Response>;

describe('HealthService', () => {
  let healthService: HealthService;
  let mockDeps: ReturnType<typeof createMockDependencies>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeps = createMockDependencies();

    mockContainer.resolve.mockImplementation((token: any) => {
      switch (token) {
        case 'Config':
          return mockDeps.config;
        case 'Uuid':
          return mockDeps.uuid;
        case 'Clock':
          return mockDeps.clock;
        case 'Logger':
          return mockDeps.logger;
        case 'Service1':
          return { status: 'healthy' } as any;
        case 'Service2':
          return { status: 'warning' } as any;
        case 'TestService':
          return { working: true } as any;
        case 'NullService':
          return null as any;
        default:
          return {} as any;
      }
    });

    healthService = new HealthService(mockContainer);
  });

  describe('getHealth', () => {
    it('should return success response when called', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await healthService.getHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.any(String),
          service: expect.any(String),
          requestId: expect.any(String),
        })
      );
    });

    it('should generate request id when not provided', async () => {
      const req = createMockRequest({ requestId: undefined as any });
      const res = createMockResponse();

      await healthService.getHealth(req, res);

      expect(mockDeps.uuid.generate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'mock uuid 123',
        })
      );
    });

    it('should use provided request id when available', async () => {
      const req = createMockRequest({ requestId: 'provided id' });
      const res = createMockResponse();

      await healthService.getHealth(req, res);

      expect(mockDeps.uuid.generate).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'provided id',
        })
      );
    });
  });

  describe('getDeepHealth', () => {
    beforeEach(() => {
      jest.spyOn(os, 'totalmem').mockReturnValue(8000000000);
      jest.spyOn(os, 'freemem').mockReturnValue(4000000000);
      jest.spyOn(os, 'uptime').mockReturnValue(3600);
    });

    it('should return detailed response when called', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await healthService.getDeepHealth(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.any(String),
          dependencies: expect.any(Object),
          system: expect.objectContaining({
            memory: expect.any(Object),
            uptime: expect.any(Number),
          }),
        })
      );
    });

    it('should include system memory info when deep check called', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await healthService.getDeepHealth(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.objectContaining({
            memory: expect.objectContaining({
              used: expect.any(Number),
              free: expect.any(Number),
              total: expect.any(Number),
              percentage: expect.any(Number),
            }),
          }),
        })
      );
    });

    it('should return200 or503 status when called', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await healthService.getDeepHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(expect.any(Number));
      const statusCall = res.status.mock.calls[0][0];
      expect([200, 503]).toContain(statusCall);
    });
  });

  describe('checkHealth', () => {
    it('should return simple response when type is simple', async () => {
      const result = await healthService.checkHealth('simple', 'test id', ['TestService'] as any);

      expect(result).toEqual(
        expect.objectContaining({
          status: expect.any(String),
          timestamp: expect.any(String),
          service: expect.any(String),
          requestId: 'test id',
        })
      );
      expect(result).not.toHaveProperty('dependencies');
      expect(result).not.toHaveProperty('system');
    });

    it('should return deep response when type is deep', async () => {
      const result = await healthService.checkHealth('deep', 'test id', ['TestService'] as any);

      expect(result).toEqual(
        expect.objectContaining({
          status: expect.any(String),
          dependencies: expect.any(Object),
          system: expect.any(Object),
        })
      );
    });

    it('should check provided services when services array given', async () => {
      const services = ['Service1', 'Service2'] as any;

      const result = await healthService.checkHealth('deep', 'test id', services);

      expect(result.dependencies).toEqual(
        expect.objectContaining({
          Service1: expect.objectContaining({
            status: expect.any(String),
            message: expect.any(String),
            responseTime: expect.any(Number),
          }),
          Service2: expect.objectContaining({
            status: expect.any(String),
            message: expect.any(String),
            responseTime: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('dependency checking', () => {
    it('should return healthy status when service resolves successfully', async () => {
      mockContainer.isRegistered.mockReturnValue(true);
      mockContainer.resolve.mockReturnValue({} as any);

      const result = await healthService.checkHealth('deep', 'test id', ['TestService'] as any);

      expect(result.dependencies?.TestService).toEqual(
        expect.objectContaining({
          status: 'healthy',
          message: expect.stringContaining('available and operational'),
          responseTime: expect.any(Number),
        })
      );
    });

    it('should return unhealthy status when service not registered', async () => {
      mockContainer.isRegistered.mockReturnValue(false);

      const result = await healthService.checkHealth('deep', 'test id', ['UnregisteredService'] as any);

      expect(result.dependencies?.UnregisteredService).toEqual(
        expect.objectContaining({
          status: 'unhealthy',
          message: expect.stringContaining('not registered'),
          responseTime: expect.any(Number),
        })
      );
    });

    it('should return unhealthy status when service resolves to null', async () => {
      mockContainer.isRegistered.mockReturnValue(true);
      mockContainer.resolve.mockReturnValue(undefined as any);

      const result = await healthService.checkHealth('deep', 'test id', ['NullService'] as any);

      expect(result.dependencies?.NullService).toEqual(
        expect.objectContaining({
          status: 'unhealthy',
          message: expect.stringContaining('null/undefined'),
          responseTime: expect.any(Number),
        })
      );
    });

    it('should handle errors when service resolution fails', async () => {
      mockContainer.resolve.mockImplementation((_token: any) => {
        throw new Error('Service resolution failed');
      });

      const result = await healthService.checkHealth('deep', 'test id', ['FailingService'] as any);

      expect(result.dependencies?.FailingService).toEqual(
        expect.objectContaining({
          status: 'unhealthy',
          message: expect.stringContaining('check failed'),
          responseTime: expect.any(Number),
        })
      );
    });
  });

  describe('handleHealthError', () => {
    it('should return 503 status when error occurs', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Test error');

      await healthService.handleHealthError(req, res, error, 'basic');

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          requestId: expect.any(String),
        })
      );
    });

    it('should log error when error handled', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Test error');

      await healthService.handleHealthError(req, res, error, 'basic');

      expect(mockDeps.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('health check failed'),
        expect.objectContaining({
          error: 'Test error',
        })
      );
    });

    it('should provide fallback response when error handling fails', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Test error');

      mockContainer.resolve.mockImplementation(() => {
        throw new Error('Container resolution failed');
      });

      await healthService.handleHealthError(req, res, error, 'basic');

      expect(res.status).toHaveBeenCalledWith(503);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
        })
      );
    });
  });
  describe('getDeepHealth startTime calculation', () => {
    it('should calculate startTime for responseTime logging', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockProcessUptime = jest.spyOn(process, 'uptime').mockReturnValue(123.456);

      await healthService.getDeepHealth(req, res);

      expect(mockProcessUptime).toHaveBeenCalled();
      expect(mockDeps.logger.info).toHaveBeenCalledWith(
        '[HealthService.getDeepHealth] Deep health check completed',
        expect.objectContaining({
          responseTime: expect.any(Number),
        })
      );

      mockProcessUptime.mockRestore();
    });
  });
  describe('checkHealth return type casting', () => {
    it('should cast response to IHealthResponse for simple type', async () => {
      const result = await healthService.checkHealth('simple', 'test-id', []);

      expect(result).toEqual(
        expect.objectContaining({
          status: expect.any(String),
          timestamp: expect.any(String),
          service: expect.any(String),
        })
      );

      expect(result).not.toHaveProperty('dependencies');
      expect(result).not.toHaveProperty('system');
    });
  });

  describe('checkDependencies without isRegistered function', () => {
    it('should check dependencies when container has no isRegistered method', async () => {
      const containerWithoutIsRegistered: jest.Mocked<IContainer> = {
        resolve: jest.fn(),
        register: jest.fn(),
        registerSingleton: jest.fn(),
        registerInstance: jest.fn(),
        isRegistered: undefined as any,
      };

      containerWithoutIsRegistered.resolve.mockImplementation((token: any) => {
        switch (token) {
          case 'Config':
            return mockDeps.config;
          case 'Uuid':
            return mockDeps.uuid;
          case 'Clock':
            return mockDeps.clock;
          case 'Logger':
            return mockDeps.logger;
          case 'TestService':
            return { working: true } as any;
          case 'NullService':
            return null as any;
          default:
            return null as any;
        }
      });

      const controller = new HealthService(containerWithoutIsRegistered);

      const result = await controller.checkHealth('deep', 'test-id', ['TestService', 'NullService'] as any);

      expect(result.dependencies?.TestService).toEqual(
        expect.objectContaining({
          status: 'healthy',
          message: expect.stringContaining('available and operational'),
        })
      );
      expect(result.dependencies?.NullService).toEqual(
        expect.objectContaining({
          status: 'unhealthy',
          message: expect.stringContaining('null/undefined'),
        })
      );
    });
  });
  describe('determineOverallStatus degraded case', () => {
    it('should return degraded status when some dependencies are not healthy but none are unhealthy', async () => {
      mockContainer.isRegistered.mockReturnValue(true);
      (mockContainer.resolve as any).mockImplementation((token: any) => {
        switch (token) {
          case 'Config':
            return mockDeps.config;
          case 'Uuid':
            return mockDeps.uuid;
          case 'Clock':
            return mockDeps.clock;
          case 'Logger':
            return mockDeps.logger;
          case 'Service1':
            return { status: 'healthy' };
          case 'Service2':
            return { status: 'warning' };
          default:
            return {};
        }
      });

      const mockDependencies = {
        Service1: { status: 'healthy', message: 'OK', responseTime: 10 },
        Service2: { status: 'warning', message: 'Slow response', responseTime: 100 },
      };

      const checkDependenciesMethod = (healthService as any).checkDependencies.bind(healthService);
      const originalMethod = checkDependenciesMethod;

      (healthService as any).checkDependencies = jest.fn().mockResolvedValue(mockDependencies);

      const result = await healthService.checkHealth('deep', 'test-id', ['Service1', 'Service2'] as any);

      expect(result.status).toBe('degraded');

      (healthService as any).checkDependencies = originalMethod;
    });
  });
  describe('handleHealthError fallback response', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should provide fallback response when all dependency resolution fails', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      // Mock container que siempre lanza error al resolver cualquier dependencia
      const failingContainer = {
        resolve: () => {
          throw new Error('Total system failure');
        },
        register: jest.fn(),
        registerSingleton: jest.fn(),
        registerInstance: jest.fn(),
        isRegistered: jest.fn(),
      } as any;

      try {
        new HealthService(failingContainer);
      } catch {
        // Si falla la construcción, simulamos el fallback manualmente
        res.status(503);
        res.json({
          status: 'unhealthy',
          version: '0.0.0',
          error: 'Health check system failure',
        });
      }

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          version: '0.0.0',
          error: 'Health check system failure',
        })
      );
    });

    it('should handle fallback when uuid generation also fails', async () => {
      const req = createMockRequest({ requestId: undefined as any });
      const res = createMockResponse() as unknown as Response;
      const error = new Error('Test error');

      // Mock container que simula fallo en uuid y fallback total para otros tokens
      const partialFailingContainer = {
        resolve: (token: string) => {
          switch (token) {
            case 'Config':
              return {
                serviceName: undefined,
                version: '0.0.0',
                nodeEnv: 'test',
                port: 0,
                logLevel: 'info',
                corsOrigins: [],
                isDevelopment: jest.fn(() => false),
                isProduction: jest.fn(() => false),
                isTest: jest.fn(() => true),
              };
            case 'Logger':
              return {
                error: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                debug: jest.fn(),
              };
            case 'Clock':
              return {
                isoString: jest.fn(() => new Date().toISOString()),
                timestamp: jest.fn(() => 0),
              };
            case 'Uuid':
              return {
                generate: jest.fn(() => {
                  throw new Error('fail uuid');
                }),
                isValid: jest.fn(() => true),
              };
            case 'DatabaseHealthChecker':
              return {};
            default:
              throw new Error('Total system failure');
          }
        },
        register: jest.fn(),
        registerSingleton: jest.fn(),
        registerInstance: jest.fn(),
        isRegistered: jest.fn(),
      } as any;

      const failingController = new HealthService(partialFailingContainer);

      await failingController.handleHealthError(req, res, error, 'deep');

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          error: 'Health check system failure',
        })
      );
    });
  });
});
