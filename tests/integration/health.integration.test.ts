import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

import { TestServer } from './helpers/test-server.js';

/**
 * Integration tests for Health Endpoint
 * Tests the complete health check functionality through HTTP
 */
describe('Health Endpoint Integration', () => {
	let testServer: TestServer;
	let app: Application;

	beforeAll(async () => {
		testServer = new TestServer(0);
		await testServer.start();
		app = await testServer.getServer().getApp();
	});

	afterAll(async () => {
		await testServer.stop();
	});

	describe('GET /health', () => {
		it('should return 200 OK', async () => {
			const response = await request(app).get('/health');

			expect(response.status).toBe(200);
		});

		it('should return valid JSON response', async () => {
			const response = await request(app).get('/health').expect('Content-Type', /json/);

			expect(response.status).toBe(200);
			expect(response.body).toBeDefined();
		});

		it('should return health response with required fields', async () => {
			const response = await request(app).get('/health');

			expect(response.body).toMatchObject({
				status: expect.stringMatching(/healthy|degraded|unhealthy/),
				timestamp: expect.any(String),
				service: expect.any(String),
				version: expect.any(String),
				uptime: expect.any(Number),
				environment: expect.any(String),
				requestId: expect.any(String),
			});
		});

		it('should return healthy status for operational system', async () => {
			const response = await request(app).get('/health');

			expect(response.body.status).toBe('healthy');
		});

		it('should include service name in response', async () => {
			const response = await request(app).get('/health');

			expect(response.body.service).toBeDefined();
			expect(typeof response.body.service).toBe('string');
			expect(response.body.service.length).toBeGreaterThan(0);
		});

		it('should include version in response', async () => {
			const response = await request(app).get('/health');

			expect(response.body.version).toBeDefined();
			expect(typeof response.body.version).toBe('string');
		});

		it('should include environment in response', async () => {
			const response = await request(app).get('/health');

			expect(response.body.environment).toBe('test');
		});

		it('should include uptime in response', async () => {
			const response = await request(app).get('/health');

			expect(response.body.uptime).toBeDefined();
			expect(typeof response.body.uptime).toBe('number');
			expect(response.body.uptime).toBeGreaterThanOrEqual(0);
		});

		it('should include timestamp in ISO format', async () => {
			const response = await request(app).get('/health');

			expect(response.body.timestamp).toBeDefined();

			// Verify it's a valid ISO date string
			const date = new Date(response.body.timestamp);
			expect(date.toString()).not.toBe('Invalid Date');
		});

		it('should include request ID in response body', async () => {
			const response = await request(app).get('/health');

			expect(response.body.requestId).toBeDefined();
			expect(typeof response.body.requestId).toBe('string');
			expect(response.body.requestId.length).toBeGreaterThan(0);
		});

		it('should include X-RequestID header in response', async () => {
			const response = await request(app).get('/health');

			expect(response.headers['x-requestid']).toBeDefined();
			expect(typeof response.headers['x-requestid']).toBe('string');
		});

		it('should accept custom X-Request-ID header', async () => {
			const customRequestId = 'test-custom-id-12345';

			const response = await request(app).get('/health').set('x-request-id', customRequestId);

			expect(response.body.requestId).toBe(customRequestId);
			expect(response.headers['x-requestid']).toBe(customRequestId);
		});

		it('should generate new request ID if not provided', async () => {
			const response1 = await request(app).get('/health');
			const response2 = await request(app).get('/health');

			expect(response1.body.requestId).toBeDefined();
			expect(response2.body.requestId).toBeDefined();
			expect(response1.body.requestId).not.toBe(response2.body.requestId);
		});

		it('should respond quickly', async () => {
			const start = Date.now();
			await request(app).get('/health');
			const duration = Date.now() - start;

			// Should respond in less than 100ms
			expect(duration).toBeLessThan(100);
		});
	});

	describe('GET /health/deep', () => {
		it('should return 200 OK for healthy system', async () => {
			const response = await request(app).get('/health/deep');

			expect(response.status).toBe(200);
		});

		it('should return valid JSON response', async () => {
			const response = await request(app).get('/health/deep').expect('Content-Type', /json/);

			expect(response.status).toBe(200);
			expect(response.body).toBeDefined();
		});

		it('should return detailed health information', async () => {
			const response = await request(app).get('/health/deep');

			expect(response.body).toMatchObject({
				status: expect.any(String),
				timestamp: expect.any(String),
				service: expect.any(String),
				version: expect.any(String),
				uptime: expect.any(Number),
				environment: expect.any(String),
				requestId: expect.any(String),
				dependencies: expect.any(Object),
				system: expect.objectContaining({
					memory: expect.objectContaining({
						used: expect.any(Number),
						free: expect.any(Number),
						total: expect.any(Number),
						percentage: expect.any(Number),
					}),
					uptime: expect.any(Number),
				}),
			});
		});

		it('should check critical service dependencies', async () => {
			const response = await request(app).get('/health/deep');

			const criticalServices = ['Config', 'Logger', 'Clock', 'Uuid'];

			criticalServices.forEach((service) => {
				expect(response.body.dependencies[service]).toBeDefined();
				expect(response.body.dependencies[service]).toMatchObject({
					status: expect.stringMatching(/healthy|degraded|unhealthy/),
					responseTime: expect.any(Number),
				});
			});
		});

		it('should report all critical services as healthy', async () => {
			const response = await request(app).get('/health/deep');

			const criticalServices = ['Config', 'Logger', 'Clock', 'Uuid'];

			criticalServices.forEach((service) => {
				expect(response.body.dependencies[service].status).toBe('healthy');
			});
		});

		it('should include system memory information', async () => {
			const response = await request(app).get('/health/deep');

			const memory = response.body.system.memory;

			expect(memory.used).toBeGreaterThan(0);
			expect(memory.free).toBeGreaterThan(0);
			expect(memory.total).toBeGreaterThan(0);
			expect(memory.percentage).toBeGreaterThan(0);
			expect(memory.percentage).toBeLessThanOrEqual(100);
		});

		it('should include system uptime', async () => {
			const response = await request(app).get('/health/deep');

			expect(response.body.system.uptime).toBeDefined();
			expect(typeof response.body.system.uptime).toBe('number');
			expect(response.body.system.uptime).toBeGreaterThan(0);
		});

		it('should measure response time for each dependency', async () => {
			const response = await request(app).get('/health/deep');

			Object.values(response.body.dependencies).forEach((dep: any) => {
				expect(dep.responseTime).toBeDefined();
				expect(typeof dep.responseTime).toBe('number');
				expect(dep.responseTime).toBeGreaterThanOrEqual(0);
				expect(dep.responseTime).toBeLessThan(1000); // Should be fast
			});
		});

		it('should include X-RequestID header', async () => {
			const response = await request(app).get('/health/deep');

			expect(response.headers['x-requestid']).toBeDefined();
		});

		it('should accept custom X-Request-ID header', async () => {
			const customRequestId = 'deep-health-test-id';

			const response = await request(app).get('/health/deep').set('x-request-id', customRequestId);

			expect(response.body.requestId).toBe(customRequestId);
		});
	});

	describe('Performance', () => {
		it('should handle multiple concurrent requests to /health', async () => {
			const requests = Array.from({ length: 10 }, () => request(app).get('/health'));

			const responses = await Promise.all(requests);

			responses.forEach((response) => {
				expect(response.status).toBe(200);
				expect(response.body.status).toBe('healthy');
			});
		});

		it('should handle multiple concurrent requests to /health/deep', async () => {
			const requests = Array.from({ length: 5 }, () => request(app).get('/health/deep'));

			const responses = await Promise.all(requests);

			responses.forEach((response) => {
				expect(response.status).toBe(200);
				expect(response.body.dependencies).toBeDefined();
			});
		});

		it('should maintain performance under load', async () => {
			const iterations = 20;
			const times: number[] = [];

			for (let i = 0; i < iterations; i++) {
				const start = Date.now();
				await request(app).get('/health');
				times.push(Date.now() - start);
			}

			const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

			// Average response time should be reasonable
			expect(avgTime).toBeLessThan(50);
		});
	});

	describe('HTTP Methods', () => {
		it('should accept GET method for /health', async () => {
			const response = await request(app).get('/health');

			expect(response.status).toBe(200);
		});

		it('should handle HEAD request for /health', async () => {
			const response = await request(app).head('/health');

			// Should return 200 or 204
			expect([200, 204]).toContain(response.status);
		});

		it('should reject POST method for /health', async () => {
			const response = await request(app).post('/health');

			// Should return 404 or 405 (Method Not Allowed)
			expect([404, 405]).toContain(response.status);
		});

		it('should reject PUT method for /health', async () => {
			const response = await request(app).put('/health');

			expect([404, 405]).toContain(response.status);
		});

		it('should reject DELETE method for /health', async () => {
			const response = await request(app).delete('/health');

			expect([404, 405]).toContain(response.status);
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid health endpoint paths gracefully', async () => {
			const response = await request(app).get('/health/invalid');

			expect(response.status).toBe(404);
		});

		it('should return proper error response for not found', async () => {
			const response = await request(app).get('/health/nonexistent');

			expect(response.status).toBe(404);
		});
	});

	describe('Consistency', () => {
		it('should return consistent service name across calls', async () => {
			const response1 = await request(app).get('/health');
			const response2 = await request(app).get('/health');

			expect(response1.body.service).toBe(response2.body.service);
		});

		it('should return consistent version across calls', async () => {
			const response1 = await request(app).get('/health');
			const response2 = await request(app).get('/health');

			expect(response1.body.version).toBe(response2.body.version);
		});

		it('should have increasing uptime over time', async () => {
			const response1 = await request(app).get('/health');
			await new Promise((resolve) => setTimeout(resolve, 100));
			const response2 = await request(app).get('/health');

			expect(response2.body.uptime).toBeGreaterThan(response1.body.uptime);
		});
	});
});
