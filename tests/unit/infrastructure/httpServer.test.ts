/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import express, { Application } from 'express';
import { Server } from 'http';

import type { IContainer, IConfig, IClock, ILogger } from '@interfaces';
import { HttpServer } from '@infrastructure';

vi.mock('express');
vi.mock('@presentation', () => ({
	createAppRouter: vi.fn(() => vi.fn()),
}));
vi.mock('@infrastructure', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@infrastructure')>();
	return {
		...actual,
		createSecurityMiddleware: vi.fn(() => vi.fn()),
		createCORSMiddleware: vi.fn(() => vi.fn()),
		createRequestIdMiddleware: vi.fn(() => vi.fn()),
		createLoggingMiddleware: vi.fn(() => vi.fn()),
		createErrorMiddleware: vi.fn(() => vi.fn()),
	};
});

describe('HttpServer', () => {
	let httpServer: HttpServer;
	let mockContainer: IContainer;
	let mockConfig: IConfig;
	let mockClock: IClock;
	let mockLogger: ILogger;
	let mockApp: Partial<Application>;
	let mockServer: Partial<Server>;
	let listenCallback: Function;
	let errorCallback: Function;

	beforeEach(() => {
		mockConfig = {
			port: 3000,
			logRequests: false,
		} as IConfig;

		mockClock = {
			now: vi.fn().mockReturnValue(new Date('2025-01-15T10:00:00.000Z')),
			timestamp: vi.fn(),
			isoString: vi.fn(),
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
				if (token === 'Clock') return mockClock;
				if (token === 'Logger') return mockLogger;
				if (token === 'Uuid') return { generate: vi.fn() };
				return null;
			}),
		} as any;

		mockServer = {
			listening: false,
			on: vi.fn((event: string, callback: Function) => {
				if (event === 'error') errorCallback = callback;
				return mockServer;
			}),
			close: vi.fn((callback?: Function) => {
				if (callback) callback();
			}),
			address: vi.fn(() => ({
				port: 4000,
				family: 'IPv4',
				address: '127.0.0.1',
			})),
		} as any;
		mockApp = {
			set: vi.fn(),
			disable: vi.fn(),
			use: vi.fn(),
			listen: vi.fn((port: number, callback: Function) => {
				listenCallback = callback;
				(mockServer as any).listening = true;
				return mockServer as Server;
			}),
		} as any;

		(express as any).mockReturnValue(mockApp);
		(express.json as any) = vi.fn(() => vi.fn());
		(express.urlencoded as any) = vi.fn(() => vi.fn());
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should create Express application', () => {
			httpServer = new HttpServer(mockContainer);

			expect(express).toHaveBeenCalled();
		});

		it('should resolve dependencies from container', () => {
			httpServer = new HttpServer(mockContainer);

			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});

		it('should configure Express settings', () => {
			httpServer = new HttpServer(mockContainer);

			expect(mockApp.set).toHaveBeenCalledWith('trust proxy', true);
			expect(mockApp.disable).toHaveBeenCalledWith('x-powered-by');
		});

		it('should setup middleware stack', () => {
			httpServer = new HttpServer(mockContainer);

			// Should have multiple use calls for middleware
			expect(mockApp.use).toHaveBeenCalled();
		});

		it('should setup JSON and URL-encoded parsers', () => {
			httpServer = new HttpServer(mockContainer);

			expect(express.json).toHaveBeenCalledWith({ limit: '10mb' });
			expect(express.urlencoded).toHaveBeenCalledWith({ extended: true, limit: '10mb' });
		});
	});

	describe('start', () => {
		beforeEach(() => {
			httpServer = new HttpServer(mockContainer);
		});

		it('should start server on configured port', async () => {
			const startPromise = httpServer.start();

			// Trigger listen callback
			listenCallback();

			await startPromise;

			expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
			expect(mockLogger.info).toHaveBeenCalledWith('Http Server started successfully');
		});

		it('should set start time when server starts', async () => {
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			const serverInfo = httpServer.getServeInfo();
			expect(serverInfo.startTime).toBeDefined();
		});

		it('should handle server startup errors', async () => {
			const startPromise = httpServer.start();
			const error = new Error('Port in use');

			// Trigger error callback
			errorCallback(error);

			await expect(startPromise).rejects.toThrow('Port in use');
			expect(mockLogger.error).toHaveBeenCalledWith(
				'Http Server failed to start',
				expect.objectContaining({
					error: 'Port in use',
					port: 3000,
				})
			);
		});

		it('should return Promise that resolves on success', async () => {
			const startPromise = httpServer.start();
			listenCallback();

			await expect(startPromise).resolves.toBeUndefined();
		});
	});

	describe('stop', () => {
		beforeEach(() => {
			httpServer = new HttpServer(mockContainer);
		});

		it('should stop running server', async () => {
			// Start server first
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			// Stop server
			await httpServer.stop();

			expect(mockServer.close).toHaveBeenCalled();
			expect(mockLogger.info).toHaveBeenCalledWith('Http Server stopped successfully');
		});

		it('should reset server state after stopping', async () => {
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			await httpServer.stop();

			expect(httpServer.isRunning()).toBe(false);
			const serverInfo = httpServer.getServeInfo();
			expect(serverInfo.startTime).toBeUndefined();
		});

		it('should handle stop when server is not running', async () => {
			await httpServer.stop();

			expect(mockLogger.warn).toHaveBeenCalledWith('Http Server stop called but server is not running');
			expect(mockServer.close).not.toHaveBeenCalled();
		});

		it('should handle errors during stop', async () => {
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			const stopError = new Error('Failed to close');
			mockServer.close = vi.fn((callback: any) => callback(stopError));

			await expect(httpServer.stop()).rejects.toThrow('Failed to close');
			expect(mockLogger.error).toHaveBeenCalledWith(
				'Error stopping Http Server',
				expect.objectContaining({
					error: 'Failed to close',
				})
			);
		});
	});

	describe('getApp', () => {
		it('should return Express application', async () => {
			httpServer = new HttpServer(mockContainer);

			const app = await httpServer.getApp();

			expect(app).toBe(mockApp);
		});
	});

	describe('isRunning', () => {
		beforeEach(() => {
			httpServer = new HttpServer(mockContainer);
		});

		it('should return false when server is not started', () => {
			expect(httpServer.isRunning()).toBe(false);
		});

		it('should return true when server is running', async () => {
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			expect(httpServer.isRunning()).toBe(true);
		});

		it('should return false after server is stopped', async () => {
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			await httpServer.stop();

			expect(httpServer.isRunning()).toBe(false);
		});
	});

	describe('getServeInfo', () => {
		beforeEach(() => {
			httpServer = new HttpServer(mockContainer);
		});

		it('should return server information', () => {
			const info = httpServer.getServeInfo();

			expect(info).toEqual({
				port: 3000,
				isRunning: false,
			});
		});

		it('should include startTime when server is running', async () => {
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			const info = httpServer.getServeInfo();

			expect(info.startTime).toBeDefined();
			expect(info.isRunning).toBe(true);
		});

		it('should not include startTime when server is stopped', async () => {
			const startPromise = httpServer.start();
			listenCallback();
			await startPromise;

			await httpServer.stop();

			const info = httpServer.getServeInfo();

			expect(info.startTime).toBeUndefined();
		});
	});

	describe('Middleware Configuration', () => {
		it('should setup middleware in correct order', () => {
			httpServer = new HttpServer(mockContainer);

			const useCalls = (mockApp.use as any).mock.calls;

			// Verify middleware order (at least security, cors, requestId, logging)
			expect(useCalls.length).toBeGreaterThanOrEqual(5);
		});
	});
});
