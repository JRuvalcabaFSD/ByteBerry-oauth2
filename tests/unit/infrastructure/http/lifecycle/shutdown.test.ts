/* eslint-disable @typescript-eslint/no-require-imports */

import { GracefulShutdown, CleanupFunction } from '@/infrastructure/lifecycle/shutdown';
import { ILogger } from '@/interfaces';

const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
} as unknown as ILogger;

jest.mock('@/shared', () => ({
  ...jest.requireActual('@/shared'),
  getErrorMessage: jest.fn(error => error.message || String(error)),
}));

describe('GracefulShutdown', () => {
  let gracefulShutdown: GracefulShutdown;
  let processOnSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    processOnSpy = jest.spyOn(process, 'on').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();

    gracefulShutdown = new GracefulShutdown(mockLogger);
  });

  afterEach(() => {
    processOnSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  /**
   * @test Registers cleanup functions correctly
   * @description Verifies that cleanup functions are properly registered
   * and the cleanup counter is accurately maintained
   */
  it('should register cleanup functions correctly', () => {
    const cleanup1: CleanupFunction = jest.fn();
    const cleanup2: CleanupFunction = jest.fn();

    gracefulShutdown.registerCleanup(cleanup1);
    gracefulShutdown.registerCleanup(cleanup2);

    expect(gracefulShutdown.registerCleanupsCount).toBe(2);
  });

  it('should execute cleanup functions during shutdown', async () => {
    const cleanup1 = jest.fn().mockResolvedValue(undefined);
    const cleanup2 = jest.fn().mockResolvedValue(undefined);

    gracefulShutdown.registerCleanup(cleanup1);
    gracefulShutdown.registerCleanup(cleanup2);

    await gracefulShutdown.shutDown();

    expect(cleanup1).toHaveBeenCalled();
    expect(cleanup2).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Starting cleanup process...', { cleanupFunctions: 2 });
    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Cleanup process completed');
  });

  it('should handle cleanup function errors gracefully', async () => {
    const cleanup1 = jest.fn().mockRejectedValue(new Error('Cleanup failed'));
    const cleanup2 = jest.fn().mockResolvedValue(undefined);

    gracefulShutdown.registerCleanup(cleanup1);
    gracefulShutdown.registerCleanup(cleanup2);

    await gracefulShutdown.shutDown();

    expect(cleanup1).toHaveBeenCalled();
    expect(cleanup2).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Cleanup function 1 failed', {
      error: 'Cleanup failed',
    });
    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown.performShutdown] Cleanup process completed');
  });

  it('should be idempotent on multiple shutdown calls', async () => {
    const cleanup = jest.fn().mockResolvedValue(undefined);
    gracefulShutdown.registerCleanup(cleanup);

    const promise1 = gracefulShutdown.shutDown();
    const promise2 = gracefulShutdown.shutDown();

    expect(promise1).toBe(promise2);

    await Promise.all([promise1, promise2]);

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('should handle signal events and trigger graceful shutdown', async () => {
    const sigTermHandler = processOnSpy.mock.calls.find(call => call[0] === 'SIGTERM')?.[1];
    const sigIntHandler = processOnSpy.mock.calls.find(call => call[0] === 'SIGINT')?.[1];

    expect(sigTermHandler).toBeDefined();
    expect(sigIntHandler).toBeDefined();

    jest.spyOn(gracefulShutdown, 'shutDown').mockResolvedValue();

    await sigTermHandler();

    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown] Received SIGTERM, starting graceful shutdown...');
    expect(gracefulShutdown.shutDown).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown] Graceful shutdown completed');
    expect(processExitSpy).toHaveBeenCalledWith(0);

    jest.clearAllMocks();
    jest.spyOn(gracefulShutdown, 'shutDown').mockResolvedValue();

    await sigIntHandler();

    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown] Received SIGINT, starting graceful shutdown...');
    expect(gracefulShutdown.shutDown).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown] Graceful shutdown completed');
    expect(processExitSpy).toHaveBeenCalledWith(0);
  });

  it('should handle signal shutdown errors appropriately', async () => {
    const shutdownError = new Error('Shutdown failed');
    const { getErrorMessage } = require('@/shared');

    const sigTermHandler = processOnSpy.mock.calls.find(call => call[0] === 'SIGTERM')?.[1];
    expect(sigTermHandler).toBeDefined();

    jest.spyOn(gracefulShutdown, 'shutDown').mockRejectedValue(shutdownError);

    await sigTermHandler();

    await new Promise(resolve => setImmediate(resolve));

    expect(mockLogger.info).toHaveBeenCalledWith('[GracefulShutdown] Received SIGTERM, starting graceful shutdown...');
    expect(gracefulShutdown.shutDown).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith('[GracefulShutdown] Graceful shutdown failed', { error: 'Shutdown failed' });
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(getErrorMessage).toHaveBeenCalledWith(shutdownError);
  });

  it('should handle uncaught exceptions with shutdown', async () => {
    const testError = new Error('Uncaught error');
    testError.stack = 'Error stack trace';
    const { getErrorMessage } = require('@/shared');

    const uncaughtHandler = processOnSpy.mock.calls.find(call => call[0] === 'uncaughtException')?.[1];
    expect(uncaughtHandler).toBeDefined();

    const shutDownPromise = Promise.resolve();
    jest.spyOn(gracefulShutdown, 'shutDown').mockReturnValue(shutDownPromise);

    uncaughtHandler(testError);

    await shutDownPromise;

    expect(mockLogger.error).toHaveBeenCalledWith('[GracefulShutdown] Uncaught exception', {
      error: 'Uncaught error',
      stack: 'Error stack trace',
    });
    expect(gracefulShutdown.shutDown).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(getErrorMessage).toHaveBeenCalledWith(testError);
  });

  it('should handle unhandled promise rejections with shutdown', async () => {
    const rejectionReason = 'Promise rejection reason';

    const rejectionHandler = processOnSpy.mock.calls.find(call => call[0] === 'unhandledRejection')?.[1];
    expect(rejectionHandler).toBeDefined();

    const shutDownPromise = Promise.resolve();
    jest.spyOn(gracefulShutdown, 'shutDown').mockReturnValue(shutDownPromise);

    rejectionHandler(rejectionReason);

    await shutDownPromise;

    expect(mockLogger.error).toHaveBeenCalledWith('[GracefulShutdown] Unhandled promise rejection', {
      reason: 'Promise rejection reason',
    });
    expect(gracefulShutdown.shutDown).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
