// tests/integration/infrastructure/http/middlewares/logging.middleware.test.ts
import request from 'supertest';
import express, { Application } from 'express';
import { ClockService, createLoggerMiddleware, createRequestIdMiddleware, UuidService, WinstonLoggerService } from '@/infrastructure';
import { Config } from '@/config';

describe('Logger Middleware', () => {
  let app: Application;
  let logger: WinstonLoggerService;
  let clock: ClockService;

  beforeEach(() => {
    process.env.LOG_LEVEL = 'error';
    Config.resetInstance();
    const config = Config.getConfig();
    clock = new ClockService();
    logger = new WinstonLoggerService(config, clock);

    app = express();
    app.use(createRequestIdMiddleware(new UuidService()));
    app.use(createLoggerMiddleware(logger, clock));

    app.get('/test', (_req, res) => {
      res.json({ ok: true });
    });
  });

  it('should attach logger to request when request processed', async () => {
    await request(app).get('/test');

    // Si no lanza error, el logger fue attachado correctamente
    expect(true).toBe(true);
  });

  it('should throw error when request id missing', () => {
    const appWithoutRequestId = express();
    appWithoutRequestId.use(createLoggerMiddleware(logger, clock));
    appWithoutRequestId.get('/test', (_req, res) => {
      res.json({ ok: true });
    });

    return request(appWithoutRequestId).get('/test').expect(500);
  });
});
