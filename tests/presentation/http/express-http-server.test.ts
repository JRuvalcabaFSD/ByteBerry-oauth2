import request from 'supertest';

import { ConsoleLogger, SystemClock } from '@/infrastructure';
import { ExpressHttpServer, HealthController } from '@/presentation';

describe('ExpressHttpServer', () => {
  let server: ExpressHttpServer;

  beforeEach(() => {
    const logger = new ConsoleLogger('debug', { service: 'test' });
    const health = new HealthController(new SystemClock(), logger, '0.0.0-test', 'oauth2');
    server = new ExpressHttpServer({ logger, port: 0, healthController: health });
  });

  afterEach(async () => await server.stop());

  it('responde 200 en GET /health', async () => {
    await server.start();
    const res = await request((server as any).app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('oauth2');
  });

  it('responde 404 en rutas no registradas', async () => {
    await server.start();
    const res = await request((server as any).app).get('/not-found');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});
