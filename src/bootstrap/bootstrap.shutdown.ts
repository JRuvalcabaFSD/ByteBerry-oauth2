import { ILogger } from '@/interfaces';

export type CleanupFunction = () => Promise<void> | void;

/**
 * Manages graceful application shutdown by orchestrating cleanup routines and handling process signals.
 *
 * Responsibilities:
 * - Registers asynchronous cleanup functions to run on shutdown.
 * - Listens for OS signals (SIGTERM, SIGINT), as well as `uncaughtException` and `unhandledRejection`, to trigger shutdown.
 * - Ensures the shutdown sequence executes at most once; concurrent callers share the same promise.
 * - Logs progress and errors via the provided logger.
 *
 * Concurrency and ordering:
 * - Registered cleanup functions are invoked in registration order but run concurrently.
 * - Failures in individual cleanup functions are caught and logged; remaining cleanup continues.
 * - If strict ordering is required, compose dependent steps within a single cleanup function.
 *
 * Usage:
 * - Instantiate once per process and register all cleanup routines during bootstrap.
 * - Cleanup functions should be idempotent and resilient to being called near process termination.
 *
 * Assumptions:
 * - `CleanupFunction` represents a function returning `void` or `Promise<void>`.
 * - `ILogger` exposes at least `info`, `debug`, and `error` methods that accept a message and optional metadata.
 *
 * @public
 * @example
 * const shutdown = new GracefulShutdown(logger);
 * shutdown.registerCleanup(async () => server.close());
 * shutdown.registerCleanup(async () => db.destroy());
 * // Optionally trigger manually:
 * await shutdown.shutdown();
 */

/**
 * Creates a new instance and registers process-level signal and error handlers.
 *
 * @param logger The logging abstraction used to record shutdown lifecycle events and errors.
 */

/**
 * Registers a cleanup function to be executed during shutdown.
 *
 * Behavior:
 * - Functions are executed concurrently during shutdown and awaited until all have settled.
 * - Errors thrown by a cleanup function are caught and logged; they do not abort the overall shutdown.
 *
 * @param cleanup The function to invoke as part of the shutdown sequence.
 */

/**
 * Initiates the graceful shutdown sequence.
 *
 * Behavior:
 * - If a shutdown is already in progress, returns the in-flight shutdown promise.
 * - Otherwise, starts execution of all registered cleanup functions and waits for them to settle.
 *
 * @returns A promise that resolves when all cleanup functions have completed (successfully or with logged errors).
 */

/**
 * Executes all registered cleanup functions and logs progress.
 *
 * Details:
 * - Each cleanup function is invoked and awaited; results are aggregated via `Promise.allSettled`.
 * - Failures are logged and do not cause the overall shutdown to reject.
 *
 * @returns A promise that resolves once all cleanup functions have settled.
 * @internal
 */

/**
 * Subscribes to process signals and unhandled error events to trigger graceful shutdown.
 *
 * Signals and events handled:
 * - `SIGTERM`, `SIGINT`: Triggers shutdown; exits with code `0` on success or `1` on failure.
 * - `uncaughtException`, `unhandledRejection`: Logs the error, triggers shutdown, and exits with code `1`.
 *
 * Note:
 * - Calls `process.exit(...)` after shutdown completion to terminate the process.
 *
 * @internal
 */
export class GracefulShutdown {
  private readonly cleanupFunctions: CleanupFunction[] = [];
  private isShuttingDown = false;
  private shutdownPromise: Promise<void> | null = null;

  /**
   * Creates an instance of GracefulShutdown.
   * @param {ILogger} logger
   * @memberof GracefulShutdown
   */
  constructor(private readonly logger: ILogger) {
    this.setupSignalHandlers();
  }

  /**
   * Register a cleanup function to be called during shutdown
   * @param {CleanupFunction} cleanup - The cleanup function to register
   * @memberof GracefulShutdown
   */
  public registerCleanup(cleanup: CleanupFunction): void {
    this.cleanupFunctions.push(cleanup);
  }

  /**
   * Initiate the shutdown process
   * @return {*}  {Promise<void>}
   * @memberof GracefulShutdown
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return this.shutdownPromise || Promise.resolve();
    }

    this.isShuttingDown = true;
    this.shutdownPromise = this.performShutdown();
    return this.shutdownPromise;
  }

  /**
   * Perform the registered cleanup functions
   * @private
   * @return {*}  {Promise<void>}
   * @memberof GracefulShutdown
   */
  private async performShutdown(): Promise<void> {
    this.logger.info('Starting cleanup process...', {
      cleanupFunctions: this.cleanupFunctions.length,
    });

    const cleanupPromises = this.cleanupFunctions.map(async (cleanup, index) => {
      try {
        this.logger.debug(`Running cleanup function ${index + 1}`);
        await cleanup();
        this.logger.debug(`Cleanup function ${index + 1} completed`);
      } catch (error) {
        this.logger.error(`Cleanup function ${index + 1} failed`, {
          error: (error as Error).message,
        });
        // Don't throw - continue with other cleanup functions
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.logger.info('Cleanup process completed');
  }

  /**
   * Setup signal handlers for graceful shutdown
   * @private
   * @memberof GracefulShutdown
   */
  private setupSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    signals.forEach(signal => {
      process.on(signal, () => {
        this.logger.info(`Received ${signal}, starting graceful shutdown...`);
        this.shutdown()
          .then(() => {
            this.logger.info('Graceful shutdown completed');
            process.exit(0);
          })
          .catch(error => {
            this.logger.error('Graceful shutdown failed', { error: error.message });
            process.exit(1);
          });
      });
    });

    process.on('uncaughtException', error => {
      this.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      this.shutdown().finally(() => process.exit(1));
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', reason => {
      this.logger.error('Unhandled promise rejection', { reason: String(reason) });
      this.shutdown().finally(() => process.exit(1));
    });
  }
}
