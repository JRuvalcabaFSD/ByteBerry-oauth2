import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestServer } from './helpers/test-server.js';

/**
 * Integration tests for Bootstrap process
 * Tests the complete application startup and shutdown lifecycle
 */
describe('Bootstrap Integration', () => {
	let testServer: TestServer;

	beforeEach(() => {
		testServer = new TestServer(0); // Random port
	});

	afterEach(async () => {
		if (testServer.isRunning()) {
			await testServer.stop();
		}
	});

	describe('Application Startup', () => {
		it('should bootstrap application successfully', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			expect(container).toBeDefined();
		});

		it('should start HTTP server on bootstrap', async () => {
			await testServer.start();

			const server = testServer.getServer();
			expect(server.isRunning()).toBe(true);
		});

		it('should assign a port to the server', async () => {
			await testServer.start();

			const port = testServer.getPort();
			expect(port).toBeGreaterThan(0);
			expect(typeof port).toBe('number');
		});

		it('should have all critical services registered', async () => {
			await testServer.start();

			const container = testServer.getContainer();

			const criticalServices = ['Config', 'Logger', 'Clock', 'Uuid', 'HttpServer', 'GracefulShutdown', 'HealthService'] as const;

			criticalServices.forEach((service) => {
				const resolved = container.resolve(service);
				expect(resolved).toBeDefined();
			});
		});

		it('should resolve Config service correctly', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const config = container.resolve('Config');

			expect(config).toBeDefined();
			expect(typeof config.isDevelopment).toBe('function');
			expect(typeof config.isProduction).toBe('function');
			expect(typeof config.isTest).toBe('function');
			expect(config.nodeEnv).toBe('test');
		});

		it('should resolve Logger service correctly', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const logger = container.resolve('Logger');

			expect(logger).toBeDefined();
			expect(typeof logger.info).toBe('function');
			expect(typeof logger.error).toBe('function');
			expect(typeof logger.warn).toBe('function');
			expect(typeof logger.debug).toBe('function');
		});

		it('should resolve Clock service correctly', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const clock = container.resolve('Clock');

			expect(clock).toBeDefined();
			expect(typeof clock.now).toBe('function');
			expect(typeof clock.timestamp).toBe('function');
			expect(typeof clock.isoString).toBe('function');
		});

		it('should resolve Uuid service correctly', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const uuid = container.resolve('Uuid');

			expect(uuid).toBeDefined();
			expect(typeof uuid.generate).toBe('function');
			expect(typeof uuid.isValid).toBe('function');
		});

		it('should resolve HealthService correctly', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const healthService = container.resolve('HealthService');

			expect(healthService).toBeDefined();
			expect(typeof healthService.getHealth).toBe('function');
			expect(typeof healthService.getDeepHealth).toBe('function');
		});

		it('should configure graceful shutdown', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const shutdown = container.resolve('GracefulShutdown');

			expect(shutdown).toBeDefined();
			expect(typeof shutdown.shutdown).toBe('function');
			expect(typeof shutdown.registerCleanup).toBe('function');
			expect(shutdown.registerCleanupsCount).toBeGreaterThan(0);
		});

		it('should register HttpServer cleanup on shutdown', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const shutdown = container.resolve('GracefulShutdown');

			// At least one cleanup should be registered (for HttpServer)
			expect(shutdown.registerCleanupsCount).toBeGreaterThanOrEqual(1);
		});
	});

	describe('Application Shutdown', () => {
		it('should shutdown gracefully', async () => {
			await testServer.start();

			const server = testServer.getServer();
			expect(server.isRunning()).toBe(true);

			await testServer.stop();

			expect(server.isRunning()).toBe(false);
		});

		it('should stop HTTP server on shutdown', async () => {
			await testServer.start();

			const server = testServer.getServer();
			const initialState = server.isRunning();

			await testServer.stop();

			const finalState = server.isRunning();

			expect(initialState).toBe(true);
			expect(finalState).toBe(false);
		});

		it('should handle multiple shutdown calls gracefully', async () => {
			await testServer.start();

			await testServer.stop();
			await testServer.stop(); // Should not throw

			const server = testServer.getServer();
			expect(server.isRunning()).toBe(false);
		});
	});

	describe('Configuration and Environment', () => {
		it('should load test environment configuration', async () => {
			process.env.NODE_ENV = 'test';
			process.env.LOG_LEVEL = 'error';

			await testServer.start();

			const container = testServer.getContainer();
			const config = container.resolve('Config');

			expect(config.nodeEnv).toBe('test');
			expect(config.logLevel).toBe('error');
		});

		it('should use random port when port is 0', async () => {
			const server1 = new TestServer(0);
			const server2 = new TestServer(0);

			await server1.start();
			await server2.start();

			const port1 = server1.getPort();
			const port2 = server2.getPort();

			// Different random ports should be assigned
			expect(port1).not.toBe(port2);
			expect(port1).toBeGreaterThan(0);
			expect(port2).toBeGreaterThan(0);

			await server1.stop();
			await server2.stop();
		});
	});

	describe('Service Integration', () => {
		it('should have services working together correctly', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const clock = container.resolve('Clock');
			const uuid = container.resolve('Uuid');

			// Test Clock service
			const timestamp = clock.timestamp();
			expect(typeof timestamp).toBe('number');
			expect(timestamp).toBeGreaterThan(0);

			// Test Uuid service
			const generatedUuid = uuid.generate();
			expect(typeof generatedUuid).toBe('string');
			expect(uuid.isValid(generatedUuid)).toBe(true);
		});

		it('should have HealthService using other services', async () => {
			await testServer.start();

			const container = testServer.getContainer();
			const healthService = container.resolve('HealthService');

			// HealthService should be able to check health using checkHealth method
			const requestId = 'test-request-id';
			const health = await healthService.checkHealth('simple', requestId, []);

			expect(health).toBeDefined();
			expect(health.status).toBeDefined();
			expect(health.timestamp).toBeDefined();
			expect(health.requestId).toBe(requestId);
		});
	});

	describe('Error Handling', () => {
		it('should throw error when accessing server before start', () => {
			expect(() => testServer.getServer()).toThrow('Server not started');
		});

		it('should throw error when accessing container before start', () => {
			expect(() => testServer.getContainer()).toThrow('Server not started');
		});

		it('should throw error when accessing port before start', () => {
			expect(() => testServer.getPort()).toThrow('Server not started');
		});

		it('should return false for isRunning before start', () => {
			expect(testServer.isRunning()).toBe(false);
		});
	});
});
