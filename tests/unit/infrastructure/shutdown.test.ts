/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ILogger } from '@interfaces';
import { GracefulShutdown } from '@infrastructure';

describe('GracefulShutdown', () => {
	let mockLogger: ILogger;
	let shutdown: GracefulShutdown;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	let processListeners: Map<string, Function>;

	beforeEach(() => {
		// Mock logger
		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		// Capture process event listeners
		processListeners = new Map();
		vi.spyOn(process, 'on').mockImplementation((event: string | symbol, handler: (...args: any[]) => void) => {
			processListeners.set(String(event), handler);
			return process;
		});

		// Mock process.exit
		vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize with logger', () => {
			shutdown = new GracefulShutdown(mockLogger);

			expect(shutdown).toBeDefined();
			expect(shutdown.registerCleanupsCount).toBe(0);
		});

		it('should setup signal handlers on construction', () => {
			shutdown = new GracefulShutdown(mockLogger);

			expect(processListeners.has('SIGTERM')).toBe(true);
			expect(processListeners.has('SIGINT')).toBe(true);
			expect(processListeners.has('uncaughtException')).toBe(true);
			expect(processListeners.has('unhandledRejection')).toBe(true);
		});
	});

	describe('registerCleanup', () => {
		beforeEach(() => {
			shutdown = new GracefulShutdown(mockLogger);
		});

		it('should register cleanup function', () => {
			const cleanup = vi.fn();

			shutdown.registerCleanup(cleanup);

			expect(shutdown.registerCleanupsCount).toBe(1);
		});

		it('should register multiple cleanup functions', () => {
			const cleanup1 = vi.fn();
			const cleanup2 = vi.fn();
			const cleanup3 = vi.fn();

			shutdown.registerCleanup(cleanup1);
			shutdown.registerCleanup(cleanup2);
			shutdown.registerCleanup(cleanup3);

			expect(shutdown.registerCleanupsCount).toBe(3);
		});
	});

	describe('shutdown', () => {
		beforeEach(() => {
			shutdown = new GracefulShutdown(mockLogger);
		});

		it('should execute all cleanup functions', async () => {
			const cleanup1 = vi.fn().mockResolvedValue(undefined);
			const cleanup2 = vi.fn().mockResolvedValue(undefined);

			shutdown.registerCleanup(cleanup1);
			shutdown.registerCleanup(cleanup2);

			await shutdown.shutdown();

			expect(cleanup1).toHaveBeenCalledOnce();
			expect(cleanup2).toHaveBeenCalledOnce();
			expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Starting cleanup process...', {
				cleanupFunctions: 2,
			});
			expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Cleanup process completed');
		});

		it('should execute sync cleanup functions', async () => {
			const syncCleanup = vi.fn();

			shutdown.registerCleanup(syncCleanup);

			await shutdown.shutdown();

			expect(syncCleanup).toHaveBeenCalledOnce();
		});

		it('should execute async cleanup functions', async () => {
			const asyncCleanup = vi.fn().mockResolvedValue(undefined);

			shutdown.registerCleanup(asyncCleanup);

			await shutdown.shutdown();

			expect(asyncCleanup).toHaveBeenCalledOnce();
		});

		it('should handle cleanup function errors without stopping', async () => {
			const cleanup1 = vi.fn().mockRejectedValue(new Error('Cleanup 1 failed'));
			const cleanup2 = vi.fn().mockResolvedValue(undefined);
			const cleanup3 = vi.fn().mockRejectedValue(new Error('Cleanup 3 failed'));

			shutdown.registerCleanup(cleanup1);
			shutdown.registerCleanup(cleanup2);
			shutdown.registerCleanup(cleanup3);

			await shutdown.shutdown();

			expect(cleanup1).toHaveBeenCalled();
			expect(cleanup2).toHaveBeenCalled();
			expect(cleanup3).toHaveBeenCalled();
			expect(mockLogger.error).toHaveBeenCalledTimes(2);
		});

		it('should return same promise for concurrent shutdown calls', async () => {
			const cleanup = vi.fn().mockResolvedValue(undefined);
			shutdown.registerCleanup(cleanup);

			const promise1 = shutdown.shutdown();
			const promise2 = shutdown.shutdown();

			expect(promise1).toBe(promise2);

			await promise1;
			expect(cleanup).toHaveBeenCalledOnce();
		});

		it('should allow new shutdown after completion', async () => {
			const cleanup = vi.fn().mockResolvedValue(undefined);
			shutdown.registerCleanup(cleanup);

			await shutdown.shutdown();
			await shutdown.shutdown();

			expect(cleanup).toHaveBeenCalledTimes(2);
		});
	});

	describe('Signal Handlers', () => {
		beforeEach(() => {
			shutdown = new GracefulShutdown(mockLogger);
		});

		it('should handle SIGTERM signal', async () => {
			const cleanup = vi.fn().mockResolvedValue(undefined);
			shutdown.registerCleanup(cleanup);

			const sigTermHandler = processListeners.get('SIGTERM');
			expect(sigTermHandler).toBeDefined();

			// Trigger SIGTERM
			sigTermHandler!();

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown] Received SIGTERM, starting graceful shutdown...');
		});

		it('should handle SIGINT signal', async () => {
			const cleanup = vi.fn().mockResolvedValue(undefined);
			shutdown.registerCleanup(cleanup);

			const sigIntHandler = processListeners.get('SIGINT');
			expect(sigIntHandler).toBeDefined();

			// Trigger SIGINT
			sigIntHandler!();

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown] Received SIGINT, starting graceful shutdown...');
		});

		it('should handle uncaughtException', async () => {
			const cleanup = vi.fn().mockResolvedValue(undefined);
			shutdown.registerCleanup(cleanup);

			const uncaughtHandler = processListeners.get('uncaughtException');
			expect(uncaughtHandler).toBeDefined();

			const error = new Error('Uncaught error');
			uncaughtHandler!(error);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockLogger.error).toHaveBeenCalledWith(
				'[GracefulShutdown] Uncaught exception',
				expect.objectContaining({
					error: 'Uncaught error',
				})
			);
		});

		it('should handle unhandledRejection', async () => {
			const cleanup = vi.fn().mockResolvedValue(undefined);
			shutdown.registerCleanup(cleanup);

			const unhandledHandler = processListeners.get('unhandledRejection');
			expect(unhandledHandler).toBeDefined();

			const reason = 'Promise rejected';
			unhandledHandler!(reason);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockLogger.error).toHaveBeenCalledWith(
				'[GracefulShutdown] Unhandled rejection',
				expect.objectContaining({
					reason: 'Promise rejected',
				})
			);
		});
	});

	describe('Cleanup Execution', () => {
		beforeEach(() => {
			shutdown = new GracefulShutdown(mockLogger);
		});

		it('should execute cleanup functions in parallel', async () => {
			const executionOrder: number[] = [];

			const cleanup1 = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 50));
				executionOrder.push(1);
			});

			const cleanup2 = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 20));
				executionOrder.push(2);
			});

			shutdown.registerCleanup(cleanup1);
			shutdown.registerCleanup(cleanup2);

			await shutdown.shutdown();

			// cleanup2 should finish before cleanup1 (parallel execution)
			expect(executionOrder).toEqual([2, 1]);
		});

		it('should log debug messages for each cleanup', async () => {
			const cleanup1 = vi.fn().mockResolvedValue(undefined);
			const cleanup2 = vi.fn().mockResolvedValue(undefined);

			shutdown.registerCleanup(cleanup1);
			shutdown.registerCleanup(cleanup2);

			await shutdown.shutdown();

			expect(mockLogger.debug).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Running cleanup function 1');
			expect(mockLogger.debug).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Cleanup function 1 completed');
			expect(mockLogger.debug).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Running cleanup function 2');
			expect(mockLogger.debug).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Cleanup function 2 completed');
		});
	});
});
