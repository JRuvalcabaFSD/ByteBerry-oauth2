// tests/integration/infrastructure/http/middlewares/error.middleware.test.ts
import request from 'supertest';
import express, { Application } from 'express';
import { Config } from '@/config';
import { ClockService, createErrorMiddleware, WinstonLoggerService } from '@/infrastructure';

describe('Error Middleware', () => {
  let app: Application;
  let config: Config;
  let logger: WinstonLoggerService;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    Config.resetInstance();
    config = Config.getConfig();
    logger = new WinstonLoggerService(config, new ClockService());

    app = express();

    app.get('/error', () => {
      throw new Error('Test error');
    });

    app.use(createErrorMiddleware(logger, config));
  });

  it('should return500 when error thrown', async () => {
    const response = await request(app).get('/error');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  });

  it('should include timestamp when error occurs', async () => {
    const response = await request(app).get('/error');

    expect(response.body).toHaveProperty('timestamp');
    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should show error message when in development', async () => {
    process.env.NODE_ENV = 'development';
    Config.resetInstance();
    const devConfig = Config.getConfig();
    const devLogger = new WinstonLoggerService(devConfig, new ClockService());

    const devApp = express();
    devApp.get('/error', () => {
      throw new Error('Detailed error');
    });
    devApp.use(createErrorMiddleware(devLogger, devConfig));

    const response = await request(devApp).get('/error');

    expect(response.body.message).toBe('Detailed error');
  });

  it('should hide error message when in production', async () => {
    process.env.NODE_ENV = 'production';
    Config.resetInstance();
    const prodConfig = Config.getConfig();
    const prodLogger = new WinstonLoggerService(prodConfig, new ClockService());

    const prodApp = express();
    prodApp.get('/error', () => {
      throw new Error('Sensitive error');
    });
    prodApp.use(createErrorMiddleware(prodLogger, prodConfig));

    const response = await request(prodApp).get('/error');

    expect(response.body.message).toBe('Something went wrong');
    expect(response.body.message).not.toBe('Sensitive error');
  });
});
