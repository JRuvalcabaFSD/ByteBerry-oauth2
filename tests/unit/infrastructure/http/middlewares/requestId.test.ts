import request from 'supertest';

import { createRequestIdMiddleware, UuidService } from '@/infrastructure';
import express, { Application } from 'express';

describe('RequestId Middleware', () => {
  let app: Application;
  let uuid: UuidService;

  beforeEach(() => {
    uuid = new UuidService();
    app = express();
    app.use(createRequestIdMiddleware(uuid));

    app.get('/test', (req, res) => {
      res.json({ requestId: req.requestId });
    });
  });

  it('should generate request id when no header provided', async () => {
    const response = await request(app).get('/test');

    expect(response.body.requestId).toBeDefined();
    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('should use provided request id when header present', async () => {
    const customRequestId = 'custom-id-12345';

    const response = await request(app).get('/test').set('x-request-id', customRequestId);

    expect(response.body.requestId).toBe(customRequestId);
    expect(response.headers['x-request-id']).toBe(customRequestId);
  });

  it('should set response header when request processed', async () => {
    const response = await request(app).get('/test');

    expect(response.headers['x-request-id']).toBeDefined();
  });
});
