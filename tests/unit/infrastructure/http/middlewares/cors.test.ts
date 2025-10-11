import request from 'supertest';
import express, { Application } from 'express';
import { Config } from '@/config';
import { createCORSMiddleware } from '@/infrastructure';

describe('CORS Middleware', () => {
  let app: Application;
  let config: Config;

  beforeEach(() => {
    process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:5173';
    Config.resetInstance();
    config = Config.getConfig();

    app = express();
    app.use(createCORSMiddleware(config));

    app.get('/test', (_req, res) => {
      res.json({ ok: true });
    });
  });

  it('should allow request when origin in allowed list', async () => {
    const response = await request(app).get('/test').set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });

  it('should return credentials when configured', async () => {
    const response = await request(app).options('/test').set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
