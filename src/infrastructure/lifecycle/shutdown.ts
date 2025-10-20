import { getErrorMessage, LogContextClass, LogContextMethod } from '@/shared';
import { ILogger } from '@/interfaces';

/**
 * A function invoked to perform cleanup tasks during application shutdown.
 *
 * The function may perform synchronous work and return void, or perform asynchronous work and return a Promise<void>.
 * Handlers should be idempotent, bounded in time, and handle their own errors where possible — uncaught errors or rejected
 * promises may affect the shutdown sequence depending on the invoker.
 *
 * @remarks
 * - Signature: () => Promise<void> | void
 * - Prefer catching and logging errors inside the cleanup function rather than allowing them to propagate.
 * - Keep cleanup operations short and respect any shutdown timeouts enforced by the host.
 *
 * @example
 * // Synchronous cleanup
 * const cleanup: CleanupFunction = () => {
 *   cache.clear();
 * };
 *
 * @example
 * // Asynchronous cleanup
 * const cleanupAsync: CleanupFunction = async () => {
 *   await db.disconnect();
 * };
 *
 * @returns A Promise that resolves when asynchronous cleanup completes, or void for synchronous cleanup.
 */

export type CleanupFunction = () => Promise<void> | void;

/**
 * GracefulShutdown
 *
 * Coordinates an orderly shutdown of the application by running registered cleanup
 * functions and wiring process-level signal and error handlers.
 *
 * Features:
 * - Allows registration of asynchronous cleanup functions via registerCleanup.
 * - Ensures shutdown is executed at most once (idempotent). Subsequent calls to
 *   shutDown() return the same completion promise.
 * - Runs all registered cleanup functions and waits for their completion (uses
 *   Promise.allSettled to ensure all handlers are given a chance to finish).
 * - Automatically hooks into SIGTERM and SIGINT and also triggers shutdown on
 *   uncaughtException and unhandledRejection, logging events through the provided logger.
 *
 * Usage:
 * - Construct with a logger implementing ILogger to receive structured lifecycle logs.
 * - Register cleanup callbacks (CleanupFunction) for resources that must be closed
 *   (servers, database connections, timers, etc.).
 * - Call shutDown() explicitly to initiate shutdown programmatically; otherwise,
 *   signals and unhandled errors will trigger it automatically.
 *
 * @param logger - ILogger used to emit informational, debug and error messages during lifecycle events.
 *
 * @remarks
 * - registerCleanup accepts asynchronous functions and they will be awaited during shutdown.
 * - shutDown() returns a Promise that resolves when the cleanup phase has completed.
 * - The class installs process listeners that call process.exit(0) on successful shutdown
 *   and process.exit(1) on failure or fatal errors.
 *
 * @example
 * const shutdown = new GracefulShutdown(logger);
 * shutdown.registerCleanup(async () => { await server.close(); });
 * shutdown.registerCleanup(async () => { await db.disconnect(); });
 *
 * // Trigger programmatic shutdown
 * await shutdown.shutDown();
 *
 * @internalremarks
 * - performShutdown and setupSignalHandlers are implementation details and not part of
 *   the public API surface; they coordinate execution and wiring of process handlers.
 */

@LogContextClass()
export class GracefulShutdown {
  private readonly cleanupFunctions: CleanupFunction[] = [];
  private isShuttingDown = false;
  private shutdownPromise: Promise<void> | null = null;
  public registerCleanupsCount: number = 0;

  constructor(private readonly logger: ILogger) {
    this.setupSignalHandlers();
  }

  public registerCleanup(cleanup: CleanupFunction): void {
    this.registerCleanupsCount++;
    this.cleanupFunctions.push(cleanup);
  }

  public async shutDown(): Promise<void> {
    if (this.isShuttingDown) {
      return this.shutdownPromise || Promise.resolve();
    }

    this.isShuttingDown = true;
    this.shutdownPromise = this.performShutdown();
    return this.shutdownPromise;
  }

  /**
   * Performs the shutdown sequence by invoking all registered cleanup functions.
   *
   * - Logs the start of the cleanup process including the number of cleanup functions.
   * - Invokes each cleanup function, logging start and completion at debug level.
   * - Catches any errors thrown by individual cleanup functions and logs them at error level
   *   (the error is formatted via getErrorMessage).
   * - Awaits completion of all cleanup invocations (using Promise.allSettled) before
   *   logging that the cleanup process has completed.
   *
   * The method resolves when every cleanup function has either fulfilled or rejected.
   * Individual cleanup failures are logged but do not cause this method to throw.
   *
   * @private
   * @returns Promise<void> that resolves after all cleanup functions have settled.
   */

  @LogContextMethod()
  private async performShutdown(): Promise<void> {
    this.logger.info('Starting cleanup process...', { cleanupFunctions: this.cleanupFunctions.length });

    const cleanupPromises = this.cleanupFunctions.map(async (cleanup, index) => {
      try {
        this.logger.debug(`Running cleanup function ${index + 1}`);
        await cleanup();
        this.logger.debug(`cleanup function ${index + 1} completed`);
      } catch (error) {
        this.logger.error(`Cleanup function ${index + 1} failed`, { error: getErrorMessage(error) });
      }

      await Promise.allSettled(cleanupPromises);
      this.logger.info('Cleanup process completed');
    });
  }

  /**
   * Sets up process-level signal and error handlers to perform a graceful shutdown.
   *
   * Installs listeners for the signals SIGTERM and SIGINT. When one of these signals is
   * received the method logs the event, invokes this.shutDown(), and:
   * - on successful resolution logs completion and calls process.exit(0)
   * - on rejection logs the error and calls process.exit(1)
   *
   * Also installs handlers for:
   * - 'uncaughtException': logs the error and stack, triggers this.shutDown(), then exits with code 1
   * - 'unhandledRejection': logs the rejection reason, triggers this.shutDown(), then exits with code 1
   *
   * Notes:
   * - Handlers perform side effects (logging and terminating the process) and therefore
   *   will end the running process after attempting a graceful shutdown.
   * - this.shutDown() is expected to return a Promise that resolves when cleanup is complete.
   *
   * @private
   * @returns void
   */

  @LogContextMethod()
  private setupSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    signals.forEach(signal => {
      process.on(signal, () => {
        this.logger.info(`Received ${signal}, starting graceful shutdown...`);
        this.shutDown()
          .then(() => {
            this.logger.info('Graceful shutdown completed');
            process.exit(0);
          })
          .catch(error => {
            this.logger.error('Graceful shutdown failed', { error: getErrorMessage(error) });
            process.exit(1);
          });
      });
    });

    process.on('uncaughtException', error => {
      this.logger.error('Uncaught exception', { error: getErrorMessage(error), stack: error.stack });
      this.shutDown().finally(() => process.exit(1));
    });

    process.on('unhandledRejection', reason => {
      this.logger.error('Unhandled promise rejection', { reason: String(reason) });
      this.shutDown().finally(() => process.exit(1));
    });
  }
}
