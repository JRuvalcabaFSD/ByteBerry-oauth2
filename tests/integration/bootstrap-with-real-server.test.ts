// tests/integration/bootstrap/bootstrap-with-real-server.test.ts
import request from 'supertest';
import { bootstrap, BootstrapResult } from '@/bootstrap';
import { Config } from '@/config/env.config';
import { IHttpServer } from '@/interfaces';

describe('Bootstrap - Real Server Integration', () => {
  let bootstrapResult: BootstrapResult;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0';
    process.env.LOG_LEVEL = 'error';
    process.env.SERVICE_NAME = 'test-service';
    process.env.CORS_ORIGINS = 'http://localhost:3000';

    Config.resetInstance();
  });

  afterEach(async () => {
    if (bootstrapResult) {
      await bootstrapResult.shutdown.shutdown();
    }
  });

  it('should serve root endpoint when server started', async () => {
    // Given
    bootstrapResult = await bootstrap();
    const httpServer = bootstrapResult.container.resolve<IHttpServer>(Symbol.for('HttpServer'));
    const app = httpServer.getApp();

    // When
    const response = await request(app).get('/');

    // Then
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('service');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('status', 'running');
  });

  it('should return404 when invalid route accessed', async () => {
    // Given
    bootstrapResult = await bootstrap();
    const httpServer = bootstrapResult.container.resolve<IHttpServer>(Symbol.for('HttpServer'));
    const app = httpServer.getApp();

    // When
    const response = await request(app).get('/non-existent-route');

    // Then
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });

  it('should include request id when request processed', async () => {
    // Given
    bootstrapResult = await bootstrap();
    const httpServer = bootstrapResult.container.resolve<IHttpServer>(Symbol.for('HttpServer'));
    const app = httpServer.getApp();

    // When
    const response = await request(app).get('/');

    // Then
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body.requestId).toBeDefined();
  });
});
