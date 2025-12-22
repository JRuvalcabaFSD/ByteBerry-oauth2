
import { createAppRouter } from '@presentation';
import { IContainer, IConfig, IClock, IHealthService } from '@interfaces';
import type { Request, Response } from 'express';

describe('App Router', () => {
	let mockConfig: IConfig;
	let mockClock: IClock;
	let mockHealthService: IHealthService;
	let mockContainer: IContainer;

	beforeEach(() => {
		mockConfig = {
			serviceName: 'TestService',
			version: '1.0.0',
			nodeEnv: 'test',
			port: 4000,
			serviceUrl: 'http://localhost',
			isDevelopment: () => false,
			isProduction: () => false,
			isTest: () => true,
			getSummary: () => ({}),
		} as any;

		mockClock = {
			now: () => new Date(),
			timestamp: () => Date.now(),
			isoString: () => '2025-01-01T00:00:00.000Z',
		};

		mockHealthService = {
			getHealth: vi.fn(),
			getDeepHealth: vi.fn(),
			checkHealth: vi.fn(),
			handleHealthError: vi.fn(),
		} as any;

		mockContainer = {
			resolve: vi.fn((token: string) => {
				if (token === 'Config') return mockConfig;
				if (token === 'Clock') return mockClock;
				if (token === 'HealthService') return mockHealthService;
				return null;
			}),
			register: vi.fn(),
			registerSingleton: vi.fn(),
			registerInstance: vi.fn(),
			isRegistered: vi.fn(),
		} as any;
	});

	describe('createAppRouter', () => {
		it('should create a router', () => {
			const router = createAppRouter(mockContainer);
			expect(router).toBeDefined();
			expect(typeof router.get).toBe('function');
		});

		it('should register health routes', () => {
			const router = createAppRouter(mockContainer);
			expect(mockContainer.resolve).toHaveBeenCalledWith('HealthService');
		});

		it('should resolve all required dependencies', () => {
			createAppRouter(mockContainer);
			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
			expect(mockContainer.resolve).toHaveBeenCalledWith('HealthService');
		});
	});

	describe('Home route GET /', () => {
		it('should return service info with correct structure', () => {
			const router = createAppRouter(mockContainer);
			const routes = (router as any).stack;

			// Encontrar la ruta GET /
			const homeRoute = routes.find((layer: any) =>
				layer.route && layer.route.path === '/' && layer.route.methods.get
			);

			expect(homeRoute).toBeDefined();
		});

		it('should include requestId in response', () => {
			const router = createAppRouter(mockContainer);
			const routes = (router as any).stack;
			const homeRoute = routes.find((layer: any) =>
				layer.route && layer.route.path === '/' && layer.route.methods.get
			);

			const req = { requestId: 'test-123' } as Request;
			const res = {
				json: vi.fn(),
			} as unknown as Response;

			homeRoute.route.stack[0].handle(req, res);

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					requestId: 'test-123',
				})
			);
		});

		it('should return service metadata', () => {
			const router = createAppRouter(mockContainer);
			const routes = (router as any).stack;
			const homeRoute = routes.find((layer: any) =>
				layer.route && layer.route.path === '/' && layer.route.methods.get
			);

			const req = { requestId: 'test-123' } as Request;
			const res = {
				json: vi.fn(),
			} as unknown as Response;

			homeRoute.route.stack[0].handle(req, res);

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					service: 'TestService',
					version: '1.0.0',
					status: 'running',
					environment: 'test',
				})
			);
		});

		it('should include endpoints list', () => {
			const router = createAppRouter(mockContainer);
			const routes = (router as any).stack;
			const homeRoute = routes.find((layer: any) =>
				layer.route && layer.route.path === '/' && layer.route.methods.get
			);

			const req = { requestId: 'test-123' } as Request;
			const res = {
				json: vi.fn(),
			} as unknown as Response;

			homeRoute.route.stack[0].handle(req, res);

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					endpoints: expect.any(Object),
				})
			);
		});
	});

	describe('404 handler', () => {
		it('should handle unknown routes', () => {
			const router = createAppRouter(mockContainer);
			const routes = (router as any).stack;

			// La última ruta debería ser el 404 handler
			const notFoundRoute = routes.find((layer: any) =>
				layer.route && layer.route.path === '{*splat}'
			);

			expect(notFoundRoute).toBeDefined();
		});

		it('should return 404 with error message', () => {
			const router = createAppRouter(mockContainer);
			const routes = (router as any).stack;
			const notFoundRoute = routes.find((layer: any) =>
				layer.route && layer.route.path === '{*splat}'
			);

			const req = {
				method: 'GET',
				originalUrl: '/unknown/path',
				requestId: 'test-123',
			} as Request;

			const res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			} as unknown as Response;

			notFoundRoute.route.stack[0].handle(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					error: 'Not found',
					requestId: 'test-123',
				})
			);
		});

		it('should include available endpoints in 404 response', () => {
			const router = createAppRouter(mockContainer);
			const routes = (router as any).stack;
			const notFoundRoute = routes.find((layer: any) =>
				layer.route && layer.route.path === '{*splat}'
			);

			const req = {
				method: 'GET',
				originalUrl: '/unknown',
				requestId: 'test-123',
			} as Request;

			const res = {
				status: vi.fn().mockReturnThis(),
				json: vi.fn(),
			} as unknown as Response;

			notFoundRoute.route.stack[0].handle(req, res);

			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					endpoints: expect.any(Object),
				})
			);
		});
	});
});
