import request from 'supertest';
import express, { Application } from 'express';
import { IClock, IConfig, IContainer, ILogger, IUuid } from '@/interfaces';
import { ServiceMap } from '@/container';
import { HealthService } from '@/infrastructure';
import { createHealthRoutes } from '@/presentation';

const createMockContainer = (): jest.Mocked<IContainer> => {
  const container: jest.Mocked<IContainer> = {
    resolve: jest.fn(),
    register: jest.fn(),
    registerSingleton: jest.fn(),
    registerInstance: jest.fn(),
    isRegistered: jest.fn(_token => true),
  };

  container.resolve.mockImplementation((token: keyof ServiceMap) => {
    switch (token) {
      case 'Config':
        return {
          serviceName: 'TestService',
          version: '1.0.0',
          nodeEnv: 'test',
          port: 3000,
          logLevel: 'info',
          corsOrigins: [],
          jwtPrivateKey: '',
          jwtPublicKey: '',
          jwtKeyId: '',
          jwtAudience: '',
          jwtIssuer: '',
          jwtExpiration: '',
          databaseUrl: '',
          isDevelopment: jest.fn(() => false),
          isProduction: jest.fn(() => false),
          isTest: jest.fn(() => true),
        } as unknown as IConfig;
      case 'Uuid':
        return {
          generate: jest.fn(() => 'test-uuid-123'),
          isValid: jest.fn(() => true),
        } as IUuid;
      case 'Clock':
        return {
          timestamp: jest.fn(() => Date.now()),
          isoString: jest.fn(() => '2025-01-01T12:00:00.000Z'),
        } as unknown as IClock;
      case 'Logger':
        return {
          info: jest.fn(),
          error: jest.fn(),
          warn: jest.fn(),
          debug: jest.fn(),
        } as unknown as ILogger;

      default:
        throw new Error('Service resolution failed');
    }
  });

  return container;
};

describe('HealthService Integration Tests', () => {
  let app: Application;
  let mockContainer: jest.Mocked<IContainer>;

  beforeEach(() => {
    mockContainer = createMockContainer();
    const healthService = new HealthService(mockContainer);

    app = express();
    app.use('/health', createHealthRoutes(healthService));
  });

  describe('GET /health', () => {
    it('should return200 status when basic health called', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: expect.any(String),
          service: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it('should_ReturnValidHealthResponse_When_Called', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('requestId');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /health/deep', () => {
    it('should return200 or503 status when deep health called', async () => {
      const response = await request(app).get('/health/deep');

      expect([200, 503]).toContain(response.status);
    });

    it('should return detailed health info when deep health called', async () => {
      const response = await request(app).get('/health/deep');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('dependencies');
      expect(response.body).toHaveProperty('system');
      expect(response.body.system).toHaveProperty('memory');
      expect(response.body.system).toHaveProperty('uptime');
    });

    it('should include memory metrics when deep health called', async () => {
      const response = await request(app).get('/health/deep');

      expect(response.body.system.memory).toEqual(
        expect.objectContaining({
          used: expect.any(Number),
          free: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
        })
      );
    });
  });

  describe('error scenarios', () => {
    it('should handle container errors when service resolution fails', async () => {
      const errorContainer = createMockContainer();

      class TestHealthService extends HealthService {
        constructor(
          container: IContainer,
          private testCriticalServices: string[]
        ) {
          super(container);
        }
        public async checkHealth(type: 'simple' | 'deep', requestId: string, _services: string[]): Promise<any> {
          return await super.checkHealth(type as any, requestId, this.testCriticalServices);
        }
      }

      errorContainer.resolve.mockImplementation((token: keyof ServiceMap) => {
        if (['Config', 'Uuid', 'Clock', 'Logger'].includes(token as string)) {
          return mockContainer.resolve(token);
        }
        throw new Error('Service resolution failed');
      });

      const critical = ['HttpServer'];
      const testHealthService = new TestHealthService(errorContainer, critical);
      const testApp = express();
      testApp.use('/health', createHealthRoutes(testHealthService));

      const response = await request(testApp).get('/health/deep');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'unhealthy');
    });

    it('should handle invalid routes when wrong endpoint called', async () => {
      const response = await request(app).get('/health/invalid');

      expect(response.status).toBe(404);
    });
  });

  describe('response format validation', () => {
    it('should return consistent format when health endpoints called', async () => {
      const basicResponse = await request(app).get('/health');
      const deepResponse = await request(app).get('/health/deep');

      const commonProps = ['status', 'timestamp', 'service', 'requestId'];
      commonProps.forEach(prop => {
        expect(basicResponse.body).toHaveProperty(prop);
        expect(deepResponse.body).toHaveProperty(prop);
      });

      expect(deepResponse.body).toHaveProperty('dependencies');
      expect(deepResponse.body).toHaveProperty('system');
    });
  });
});
