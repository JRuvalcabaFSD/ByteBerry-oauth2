/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IContainer, ILogger, IHttpServer } from '@interfaces';
import { configureShutdown, GracefulShutdown } from '@infrastructure';

vi.mock('@shared', async () => {
	const actual = await vi.importActual('@shared');
	return {
		...actual,
		wrapContainerLogger: vi.fn((container) => container),
		getErrMsg: vi.fn((error: any) => error?.message || String(error)),
	};
});

describe('ShutdownConfig', () => {
	let mockContainer: IContainer;
	let mockLogger: ILogger;
	let mockHttpServer: IHttpServer;
	let mockGracefulShutdown: GracefulShutdown;
	let registeredCleanup: Function;

	beforeEach(() => {
		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
		} as any;

		mockHttpServer = {
			start: vi.fn(),
			stop: vi.fn().mockResolvedValue(undefined),
			getApp: vi.fn(),
			isRunning: vi.fn(),
			getServeInfo: vi.fn(),
		};

		mockGracefulShutdown = {
			registerCleanup: vi.fn((cleanup: Function) => {
				registeredCleanup = cleanup;
			}),
			shutdown: vi.fn(),
		} as any;

		mockContainer = {
			resolve: vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return mockHttpServer;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				return null;
			}),
		} as any;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('configureShutdown', () => {
		it('should wrap container with logger context', async () => {
			const { wrapContainerLogger } = await import('@shared');

			configureShutdown(mockContainer);

			expect(wrapContainerLogger).toHaveBeenCalledWith(mockContainer, 'configureShutdown');
		});

		it('should resolve GracefulShutdown from container', () => {
			configureShutdown(mockContainer);

			expect(mockContainer.resolve).toHaveBeenCalledWith('GracefulShutdown');
		});

		it('should resolve Logger from container', () => {
			configureShutdown(mockContainer);

			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});

		it('should log configuration start', () => {
			configureShutdown(mockContainer);

			expect(mockLogger.debug).toHaveBeenCalledWith('Configuring graceful shutdown');
		});

		it('should register cleanup function', () => {
			configureShutdown(mockContainer);

			expect(mockGracefulShutdown.registerCleanup).toHaveBeenCalledWith(expect.any(Function));
		});

		it('should return GracefulShutdown instance', () => {
			const result = configureShutdown(mockContainer);

			expect(result).toBe(mockGracefulShutdown);
		});
	});

	describe('Cleanup Function', () => {
		beforeEach(() => {
			configureShutdown(mockContainer);
		});

		it('should resolve HttpServer when cleanup is executed', async () => {
			await registeredCleanup();

			expect(mockContainer.resolve).toHaveBeenCalledWith('HttpServer');
		});

		it('should call httpServer.stop() when cleanup is executed', async () => {
			await registeredCleanup();

			expect(mockHttpServer.stop).toHaveBeenCalledOnce();
		});

		it('should log closing message before stopping server', async () => {
			await registeredCleanup();

			expect(mockLogger.debug).toHaveBeenCalledWith('Closing Http Server');
		});

		it('should log success message after stopping server', async () => {
			await registeredCleanup();

			expect(mockLogger.info).toHaveBeenCalledWith('Http Server closed');
		});

		it('should handle httpServer being null', async () => {
			mockContainer.resolve = vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return null;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				return null;
			}) as any;

			configureShutdown(mockContainer);
			await registeredCleanup();

			expect(mockHttpServer.stop).not.toHaveBeenCalled();
			expect(mockLogger.info).not.toHaveBeenCalledWith('Http Server closed');
		});

		it('should handle httpServer.stop not being a function', async () => {
			const _invalidHttpServer = {
				start: vi.fn(),
				// stop is missing or not a function
			} as any;

			mockContainer.resolve = vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return _invalidHttpServer;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				return null;
			}) as any;

			configureShutdown(mockContainer);
			await registeredCleanup();

			expect(mockLogger.info).not.toHaveBeenCalledWith('Http Server closed');
		});

		it('should log error when httpServer.stop() fails', async () => {
			const stopError = new Error('Failed to stop server');
			mockHttpServer.stop = vi.fn().mockRejectedValue(stopError);

			await expect(registeredCleanup()).rejects.toThrow('Failed to stop server');

			expect(mockLogger.error).toHaveBeenCalledWith(
				'Failed to stop Http Server',
				expect.objectContaining({
					error: 'Failed to stop server',
				})
			);
		});

		it('should propagate error when httpServer.stop() fails', async () => {
			const stopError = new Error('Server stop error');
			mockHttpServer.stop = vi.fn().mockRejectedValue(stopError);

			await expect(registeredCleanup()).rejects.toThrow(stopError);
		});

		it('should handle error during container.resolve', async () => {
			mockContainer.resolve = vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				if (token === 'HttpServer') throw new Error('Resolution failed');
				return null;
			}) as any;

			configureShutdown(mockContainer);

			await expect(registeredCleanup()).rejects.toThrow('Resolution failed');
			expect(mockLogger.error).toHaveBeenCalledWith(
				'Failed to stop Http Server',
				expect.objectContaining({
					error: 'Resolution failed',
				})
			);
		});

		it('should call stop() only if httpServer exists and has stop method', async () => {
			// Test with valid httpServer
			await registeredCleanup();
			expect(mockHttpServer.stop).toHaveBeenCalledTimes(1);

			// Reset and test with null httpServer
			vi.clearAllMocks();
			mockContainer.resolve = vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return null;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				return null;
			}) as any;

			configureShutdown(mockContainer);
			await registeredCleanup();

			expect(mockHttpServer.stop).not.toHaveBeenCalled();
		});
	});

	describe('Integration', () => {
		it('should configure shutdown with all steps in order', async () => {
			const executionOrder: string[] = [];

			const { wrapContainerLogger } = await import('@shared');
			(wrapContainerLogger as any).mockImplementation((container: any, context: string) => {
				executionOrder.push(`wrap:${context}`);
				return container;
			});

			mockContainer.resolve = vi.fn((token: string) => {
				executionOrder.push(`resolve:${token}`);
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return mockHttpServer;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				return null;
			}) as any;

			mockLogger.debug = vi.fn((msg: string) => {
				executionOrder.push(`log:${msg}`);
			});

			mockGracefulShutdown.registerCleanup = vi.fn((cleanup: Function) => {
				executionOrder.push('register:cleanup');
				registeredCleanup = cleanup;
			});

			configureShutdown(mockContainer);

			expect(executionOrder).toEqual([
				'wrap:configureShutdown',
				'resolve:GracefulShutdown',
				'resolve:Logger',
				'log:Configuring graceful shutdown',
				'register:cleanup',
			]);
		});

		it('should successfully stop server during cleanup', async () => {
			configureShutdown(mockContainer);

			await registeredCleanup();

			expect(mockHttpServer.stop).toHaveBeenCalled();
			expect(mockLogger.info).toHaveBeenCalledWith('Http Server closed');
			expect(mockLogger.error).not.toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle undefined httpServer gracefully', async () => {
			mockContainer.resolve = vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return undefined;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				return null;
			}) as any;

			configureShutdown(mockContainer);

			await expect(registeredCleanup()).resolves.not.toThrow();
		});

		it('should handle httpServer with stop as non-function property', async () => {
			const invalidServer = {
				start: vi.fn(),
				stop: 'not-a-function', // stop exists but is not a function
			} as any;

			mockContainer.resolve = vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return invalidServer;
				if (token === 'GracefulShutdown') return mockGracefulShutdown;
				return null;
			});

			configureShutdown(mockContainer);

			await expect(registeredCleanup()).resolves.not.toThrow();
			expect(mockLogger.info).not.toHaveBeenCalledWith('Http Server closed');
		});

		it('should use original container for httpServer resolution in cleanup', async () => {
			// The cleanup function uses the original container, not the wrapped one
			const originalResolve = mockContainer.resolve;

			configureShutdown(mockContainer);
			await registeredCleanup();

			// Verify it called resolve on the original container
			expect(originalResolve).toHaveBeenCalledWith('HttpServer');
		});
	});
});
