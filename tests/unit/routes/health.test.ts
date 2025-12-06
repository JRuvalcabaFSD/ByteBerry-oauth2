/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from 'express';

import type { IHealthService } from '@interfaces';
import { createHeathRouter } from '@presentation';

vi.mock('express', async () => {
	const actual = await vi.importActual('express');
	return {
		...actual,
		Router: vi.fn(() => ({
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
			use: vi.fn(),
		})),
	};
});

describe('HealthRoutes', () => {
	let mockHealthService: IHealthService;
	let mockRouter: any;

	beforeEach(() => {
		mockHealthService = {
			getHealth: vi.fn(),
			getDeepHealth: vi.fn(),
			checkHealth: vi.fn(),
			handleHealthError: vi.fn(),
		} as any;

		mockRouter = {
			get: vi.fn(),
			post: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
			use: vi.fn(),
		};

		(Router as any).mockReturnValue(mockRouter);
	});

	describe('createHeathRouter', () => {
		it('should create router with health endpoints', () => {
			const router = createHeathRouter(mockHealthService);

			expect(Router).toHaveBeenCalledOnce();
			expect(router).toBe(mockRouter);
		});

		it('should register GET / route for basic health check', () => {
			createHeathRouter(mockHealthService);

			expect(mockRouter.get).toHaveBeenCalledWith('/', mockHealthService.getHealth);
		});

		it('should register GET /deep route for deep health check', () => {
			createHeathRouter(mockHealthService);

			expect(mockRouter.get).toHaveBeenCalledWith('/deep', mockHealthService.getDeepHealth);
		});

		it('should register both routes', () => {
			createHeathRouter(mockHealthService);

			expect(mockRouter.get).toHaveBeenCalledTimes(2);
			expect(mockRouter.get).toHaveBeenNthCalledWith(1, '/', mockHealthService.getHealth);
			expect(mockRouter.get).toHaveBeenNthCalledWith(2, '/deep', mockHealthService.getDeepHealth);
		});

		it('should pass controller methods as route handlers', () => {
			createHeathRouter(mockHealthService);

			const firstCall = mockRouter.get.mock.calls[0];
			const secondCall = mockRouter.get.mock.calls[1];

			expect(firstCall[1]).toBe(mockHealthService.getHealth);
			expect(secondCall[1]).toBe(mockHealthService.getDeepHealth);
		});
	});
});
