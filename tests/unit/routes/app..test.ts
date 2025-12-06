import express from 'express';
/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';

import type { IContainer, IConfig, IClock, IHealthService } from '@interfaces';
import { createAppRouter } from '@presentation';

describe('AppRouter', () => {
	let mockContainer: IContainer;
	let mockConfig: IConfig;
	let mockClock: IClock;
	let mockHealthService: IHealthService;
	let app: express.Express;

	beforeEach(() => {
		mockConfig = {
			serviceName: 'test-service',
			version: '1.0.0',
			nodeEnv: 'test',
			port: 3000,
			logLevel: 'info',
			logRequests: false,
			jwtIssuer: '',
			jwtAudience: '',
			jwtSecret: '',
			jwtExpiration: '',
			allowedOrigins: [],
			// ...agrega cualquier otra propiedad requerida por IConfig
		} as any;

		mockClock = {
			isoString: vi.fn().mockReturnValue('2025-01-15T10:00:00.000Z'),
			timestamp: vi.fn(),
			now: vi.fn(),
		} as any;

		mockHealthService = {
			getHealth: vi.fn(),
			getDeepHealth: vi.fn(),
		} as any;

		mockContainer = {
			resolve: vi.fn((token: string) => {
				if (token === 'Config') return mockConfig;
				if (token === 'Clock') return mockClock;
				if (token === 'HealthService') return mockHealthService;
				return null;
			}),
		} as any;

		app = express();
		// Middleware para copiar x-request-id a req.requestId
		app.use((req, res, next) => {
			req.requestId = req.headers['x-request-id'] as string;
			next();
		});
		app.use(createAppRouter(mockContainer));
	});

	describe('Home Route', () => {
		it('should return service information on home route', async () => {
			const res = await request(app).get('/').set('x-request-id', 'test-id');

			expect(res.status).toBe(200);
			expect(res.body).toEqual({
				service: 'test-service',
				version: '1.0.0',
				status: 'running',
				timestamp: '2025-01-15T10:00:00.000Z',
				requestId: 'test-id',
				environment: 'test',
				endpoints: { home: '/' },
			});
		});

		it('should include endpoints list in home response', async () => {
			const res = await request(app).get('/').set('x-request-id', 'test-id');

			expect(res.status).toBe(200);
			expect(res.body.endpoints).toEqual({ home: '/' });
		});
	});

	describe('404 Handler', () => {
		it('should return 404 with error message', async () => {
			const res = await request(app).get('/unknown-route').set('x-request-id', 'test-id');

			expect(res.status).toBe(404);
			expect(res.body).toEqual({
				error: 'Not found',
				message: 'Route GET /unknown-route not found',
				requestId: 'test-id',
				timestamp: '2025-01-15T10:00:00.000Z',
				endpoints: { home: '/' },
			});
		});

		it('should include method and url in 404 response', async () => {
			const res = await request(app).get('/api/unknown').set('x-request-id', 'test-id');

			expect(res.status).toBe(404);
			expect(res.body).toEqual({
				error: 'Not found',
				message: 'Route GET /api/unknown not found',
				requestId: 'test-id',
				timestamp: '2025-01-15T10:00:00.000Z',
				endpoints: { home: '/' },
			});
		});
	});
});
