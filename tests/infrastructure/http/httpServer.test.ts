import request from 'supertest';

import { HttpServer } from '@/infrastructure';
import { IEnvConfig, IHttpServer, IUuid } from '@/interfaces';

describe('HttpServer', () => {
  let httpServer: IHttpServer;
  let mockConfig: IEnvConfig;
  let mockUuid: IUuid;

  beforeEach(() => {
    mockConfig = {
      port: 3000,
      nodeEnv: 'development',
      logLevel: 'info',
      isDevelopment: () => false,
      isProduction: () => false,
      isTest: () => true,
    };

    mockUuid = {
      generate: jest.fn(() => 'test-uuid-12345'),
    };

    httpServer = new HttpServer(mockConfig, mockUuid);
  });
  afterEach(async () => {
    if (httpServer.isRunning()) {
      await httpServer.stop();
    }
  });

  it('should create HttpServer with dependencies injected', () => {
    expect(httpServer).toBeDefined();
    expect(httpServer.isRunning()).toBeFalsy();
    expect(httpServer.getApp).toBeDefined();
  });
  it('should start server successfully', async () => {
    await httpServer.start();
    expect(httpServer.isRunning()).toBeTruthy();
  });
  it('should stop server gracefully', async () => {
    await httpServer.start();
    expect(httpServer.isRunning()).toBeTruthy();

    await httpServer.stop();
    expect(httpServer.isRunning()).toBeFalsy();
  });
  it('should add X-Request-ID header to requests', async () => {
    await httpServer.start();
    const app = httpServer.getApp();

    const response = await request(app).get('/non-existent');

    expect(response.headers['x-request-id']).toBe('test-uuid-12345');
  });
  it('should use existing X-Request-ID from request headers', async () => {
    await httpServer.start();
    const app = httpServer.getApp();
    const existingRequestId = 'existing-request-id';

    const response = await request(app).get('/non-existent').set('X-Request-ID', existingRequestId);

    expect(response.headers['x-request-id']).toBe(existingRequestId);
    expect(mockUuid.generate).not.toHaveBeenCalled();
  });
});
