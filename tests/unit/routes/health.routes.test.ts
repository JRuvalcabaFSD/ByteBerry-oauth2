import { createHealthRoutes } from '@presentation';
import { IHealthService } from '@interfaces';

describe('Health Routes', () => {
	const mockHealthService: IHealthService = {
		getHealth: vi.fn(),
		getDeepHealth: vi.fn(),
		checkHealth: vi.fn(),
		handleHealthError: vi.fn(),
	} as any;

	describe('createHealthRoutes', () => {
		it('should create a router with health endpoints', () => {
			const router = createHealthRoutes(mockHealthService);
			expect(router).toBeDefined();
			expect(typeof router.get).toBe('function');
		});

		it('should register GET / endpoint', () => {
			const router = createHealthRoutes(mockHealthService);
			const routes = (router as any).stack || [];
			const healthRoute = routes.find((r: any) => r.route?.path === '/');
			expect(healthRoute).toBeDefined();
		});

		it('should register GET /deep endpoint', () => {
			const router = createHealthRoutes(mockHealthService);
			const routes = (router as any).stack || [];
			const deepRoute = routes.find((r: any) => r.route?.path === '/deep');
			expect(deepRoute).toBeDefined();
		});
	});
});
