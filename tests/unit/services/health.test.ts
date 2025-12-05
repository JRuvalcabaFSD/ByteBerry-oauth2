/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

import type { IContainer, IConfig, IUuid, IClock, ILogger } from '@interfaces';
import { HealthService } from '@infrastructure';

describe('HealthService', () => {
	let healthService: HealthService;
	let mockContainer: IContainer;
	let mockConfig: IConfig;
	let mockUuid: IUuid;
	let mockClock: IClock;
	let mockLogger: ILogger;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		mockConfig = {
			serviceName: 'test-service',
			version: '1.0.0',
			nodeEnv: 'test',
		} as IConfig;

		mockUuid = {
			generate: vi.fn().mockReturnValue('generated-uuid'),
			isValid: vi.fn(),
		};

		mockClock = {
			timestamp: vi.fn().mockReturnValue(1000),
			isoString: vi.fn().mockReturnValue('2025-01-15T10:00:00.000Z'),
			now: vi.fn().mockReturnValue(new Date('2025-01-15T10:00:00.000Z')),
		};

		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
		} as any;

		mockContainer = {
			resolve: vi.fn((token: string) => {
				if (token === 'Config') return mockConfig;
				if (token === 'Uuid') return mockUuid;
				if (token === 'Clock') return mockClock;
				if (token === 'Logger') return mockLogger;
				return null;
			}),
			isRegistered: vi.fn().mockReturnValue(true),
		} as any;

		mockRequest = {
			requestId: 'test-request-id',
		};

		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};

		// Mock process.uptime
		vi.spyOn(process, 'uptime').mockReturnValue(100);

		healthService = new HealthService(mockContainer);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should resolve dependencies from container', () => {
			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Uuid');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});
	});

	describe('getHealth', () => {
		it('should return 200 with health response', async () => {
			await healthService.getHealth(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: expect.any(String),
					timestamp: '2025-01-15T10:00:00.000Z',
					service: 'test-service',
					version: '1.0.0',
					requestId: 'test-request-id',
					environment: 'test',
				})
			);
		});

		it('should use existing requestId from request', async () => {
			await healthService.getHealth(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					requestId: 'test-request-id',
				})
			);
		});

		it('should generate requestId if not present', async () => {
			mockRequest.requestId = undefined;

			await healthService.getHealth(mockRequest as Request, mockResponse as Response);

			expect(mockUuid.generate).toHaveBeenCalled();
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					requestId: 'generated-uuid',
				})
			);
		});

		it('should include uptime in milliseconds', async () => {
			await healthService.getHealth(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					uptime: 100000, // 100 seconds * 1000
				})
			);
		});

		it('should handle errors and delegate to handleHealthError', async () => {
			const error = new Error('Health check failed');
			healthService = new HealthService(mockContainer);
			vi.spyOn(healthService, 'checkHealth').mockRejectedValue(error);

			await expect(healthService.getHealth(mockRequest as Request, mockResponse as Response)).resolves.not.toThrow();

			expect(mockResponse.status).toHaveBeenCalledWith(503);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'unhealthy',
					timestamp: expect.any(String),
					service: 'test-service',
					version: '1.0.0',
				})
			);
		});
	});

	describe('getDeepHealth', () => {
		it('should return 200 for healthy status', async () => {
			mockContainer.isRegistered = vi.fn().mockReturnValue(true);
			mockContainer.resolve = vi.fn().mockImplementation((token) => {
				// Devuelve un objeto simulado para cada servicio crítico
				return {};
			});

			await healthService.getDeepHealth(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it('should return 503 for unhealthy status', async () => {
			mockContainer.isRegistered = vi.fn().mockReturnValue(false);

			await healthService.getDeepHealth(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.status).toHaveBeenCalledWith(503);
		});

		it('should include dependencies in response', async () => {
			await healthService.getDeepHealth(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					dependencies: expect.any(Object),
				})
			);
		});

		it('should include system information', async () => {
			await healthService.getDeepHealth(mockRequest as Request, mockResponse as Response);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					system: expect.objectContaining({
						memory: expect.any(Object),
						uptime: expect.any(Number),
					}),
				})
			);
		});

		it('should generate requestId if not present', async () => {
			mockRequest.requestId = undefined;

			await healthService.getDeepHealth(mockRequest as Request, mockResponse as Response);

			expect(mockUuid.generate).toHaveBeenCalled();
		});

		it('should log completion with metrics', async () => {
			await healthService.getDeepHealth(mockRequest as Request, mockResponse as Response);

			expect(mockLogger.info).toHaveBeenCalledWith(
				'[HealthService.getDeepHealth] Deep health check completed',
				expect.objectContaining({
					requestId: expect.any(String),
					status: expect.any(String),
					responseTime: expect.any(Number),
					dependenciesCount: expect.any(Number),
				})
			);
		});
	});

	describe('checkDependencies', () => {
		it('should return healthy for registered services', async () => {
			const dependencies = await (healthService as any).checkDependencies(['Config', 'Logger']);

			expect(dependencies.Config.status).toBe('healthy');
			expect(dependencies.Logger.status).toBe('healthy');
		});

		it('should return unhealthy for unregistered services', async () => {
			mockContainer.isRegistered = vi.fn().mockReturnValue(false);

			const dependencies = await (healthService as any).checkDependencies(['MissingService']);

			expect(dependencies.MissingService.status).toBe('unhealthy');
			expect(dependencies.MissingService.message).toContain('not registered');
		});

		it('should include response time for each service', async () => {
			const dependencies = await (healthService as any).checkDependencies(['Config']);

			expect(dependencies.Config.responseTime).toBeGreaterThanOrEqual(0);
		});

		it('should handle service resolution errors', async () => {
			mockContainer.resolve = vi.fn().mockImplementation(() => {
				throw new Error('Resolution failed');
			});

			const dependencies = await (healthService as any).checkDependencies(['Config']);

			expect(dependencies.Config.status).toBe('unhealthy');
			expect(dependencies.Config.message).toContain('check failed');
		});

		it('should mark as unhealthy if service resolves to null', async () => {
			mockContainer.resolve = vi.fn().mockReturnValue(null);

			const dependencies = await (healthService as any).checkDependencies(['NullService']);

			expect(dependencies.NullService.status).toBe('unhealthy');
			expect(dependencies.NullService.message).toContain('resolved null/undefined');
		});
	});

	describe('determineOverallStatus', () => {
		it('should return healthy when all dependencies are healthy', () => {
			const dependencies = {
				Service1: { status: 'healthy' as const, message: '', responseTime: 10 },
				Service2: { status: 'healthy' as const, message: '', responseTime: 20 },
			};

			const status = (healthService as any).determineOverallStatus(dependencies);

			expect(status).toBe('healthy');
		});

		it('should return unhealthy when at least one dependency is unhealthy', () => {
			const dependencies = {
				Service1: { status: 'healthy' as const, message: '', responseTime: 10 },
				Service2: { status: 'unhealthy' as const, message: '', responseTime: 20 },
			};

			const status = (healthService as any).determineOverallStatus(dependencies);

			expect(status).toBe('unhealthy');
		});

		it('should return degraded when no unhealthy but not all healthy', () => {
			const dependencies = {
				Service1: { status: 'healthy' as const, message: '', responseTime: 10 },
				Service2: { status: 'degraded' as const, message: '', responseTime: 20 },
			};

			const status = (healthService as any).determineOverallStatus(dependencies);

			expect(status).toBe('degraded');
		});
	});

	describe('getSystemInfo', () => {
		it('should return memory information', () => {
			const systemInfo = (healthService as any).getSystemInfo();

			expect(systemInfo.memory).toBeDefined();
			expect(systemInfo.memory.used).toBeGreaterThanOrEqual(0);
			expect(systemInfo.memory.free).toBeGreaterThanOrEqual(0);
			expect(systemInfo.memory.total).toBeGreaterThanOrEqual(0);
			expect(systemInfo.memory.percentage).toBeGreaterThanOrEqual(0);
			expect(systemInfo.memory.percentage).toBeLessThanOrEqual(100);
		});

		it('should return system uptime', () => {
			const systemInfo = (healthService as any).getSystemInfo();

			expect(systemInfo.uptime).toBeGreaterThanOrEqual(0);
		});
	});

	describe('handleHealthError', () => {
		it('should return 503 with error response', async () => {
			const error = new Error('Health check failed');

			await healthService.handleHealthError(mockRequest as Request, mockResponse as Response, error, 'basic');

			expect(mockResponse.status).toHaveBeenCalledWith(503);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'unhealthy',
					timestamp: expect.any(String),
					service: 'test-service',
					version: '1.0.0',
				})
			);
		});

		it('should log error with details', async () => {
			const error = new Error('Health check failed');
			error.stack = 'Error stack trace';

			await healthService.handleHealthError(mockRequest as Request, mockResponse as Response, error, 'deep');

			expect(mockLogger.error).toHaveBeenCalledWith(
				'deep health check failed',
				expect.objectContaining({
					requestId: 'test-request-id',
					error: 'Health check failed',
					stack: 'Error stack trace',
				})
			);
		});

		it('should use generated requestId if not in request', async () => {
			mockRequest.requestId = undefined;
			const error = new Error('Test error');

			await healthService.handleHealthError(mockRequest as Request, mockResponse as Response, error, 'basic');

			expect(mockUuid.generate).toHaveBeenCalled();
		});

		it('should handle cascading failures with safe fallback', async () => {
			const error = new Error('Config access failed');
			// Simulate config access throwing error
			Object.defineProperty(mockConfig, 'serviceName', {
				get: () => {
					throw new Error('Config getter failed');
				},
			});

			await healthService.handleHealthError(mockRequest as Request, mockResponse as Response, error, 'basic');

			expect(mockResponse.status).toHaveBeenCalledWith(503);
			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'unhealthy',
					error: 'Health check system failure',
					service: undefined,
					version: '0.0.0',
				})
			);
		});
	});
});
