/* eslint-disable no-console */
import { BootstrapError, getErrorMessage, withLoggerContext, wrapContainerLogger } from '@/shared';
import { bootstrapContainer, criticalServices, ServiceMap, Token } from '@/container';
import { configureShutdown, GracefulShutdown } from '@/infrastructure';
import { IContainer, ILogger } from '@/interfaces';

/**
 * Represents the result of the bootstrap process.
 *
 * @export
 * @interface BootstrapResult
 */

export interface BootstrapResult {
  container: IContainer<ServiceMap>;
  shutdown: GracefulShutdown;
}

/**
 * Bootstraps the application.
 *
 * Initializes the dependency injection container and logger, validates required services,
 * configures graceful shutdown handling, and starts the HTTP server.
 *
 * The function:
 * - wraps the container logger context for bootstrap operations,
 * - resolves and configures the application logger,
 * - validates services required for runtime,
 * - configures process shutdown handlers,
 * - starts the HTTP server and awaits successful start,
 * - returns the initialized container and a shutdown handler.
 *
 * On failure, if a logger has been resolved it logs an error with the original error
 * and stack (when available). If the logger is not yet available it falls back to
 * console.error. In all failure cases a BootstrapError is thrown containing:
 * - originalError: a string message of the original error,
 * - phase: set to 'bootstrap',
 * - timestamp: ISO timestamp of the failure.
 *
 * Side effects:
 * - starts the HTTP server,
 * - registers shutdown handlers that can be invoked to gracefully stop services,
 * - writes error information to the configured logger or to console.
 *
 * Usage:
 * const { container, shutdown } = await bootstrap();
 * // ...later, call shutdown() to gracefully stop the service.
 *
 * @returns A Promise that resolves to a BootstrapResult containing the initialized
 *          DI container and a shutdown function.
 *
 * @throws {BootstrapError} If any step of the bootstrap process fails.
 *
 * @public
 * @async
 */

export async function bootstrap(): Promise<BootstrapResult> {
  let logger: ILogger | undefined;

  try {
    const container = wrapContainerLogger(bootstrapContainer(), 'bootstrap');
    logger = container.resolve('Logger');

    logger.info('Service starting');

    const shutdown = configureShutdown(container);
    const httpServer = container.resolve('HttpServer');

    await validateServices(container, logger);
    await httpServer.start();

    return { container, shutdown };
  } catch (error) {
    if (logger) {
      logger.error('Service failed', {
        error: getErrorMessage(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } else {
      console.error('Bootstrap failed before logger was available:', getErrorMessage(error));
    }

    throw new BootstrapError(`Service bootstrap failed: ${getErrorMessage(error)}`, {
      originalError: getErrorMessage(error),
      phase: 'bootstrap',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Validates that every token listed in the module-level `criticalServices` array is registered in and
 * resolvable from the provided dependency injection container.
 *
 * For each service token the function:
 * - logs an informational message (with a `validateServices` logger context) about the validation run,
 * - checks `container.isRegistered(token)` and throws if the token is not registered,
 * - calls `container.resolve(token)` and throws if the resolved value is `null` or `undefined`,
 * - logs a debug message when a service validates successfully.
 *
 * Validation failures are logged as errors and cause the function to throw a `BootstrapError` containing
 * `serviceName` and `originalError` fields so callers can abort startup and inspect the failure.
 *
 * @param container - The DI container (IContainer<ServiceMap, Token>) used to check registration and resolve services.
 * @param logger - ILogger used for contextualized info/debug/error logging during validation.
 * @returns A Promise that resolves when all critical services have been validated successfully.
 * @throws {BootstrapError} If any critical service is missing or resolves to a falsy value. The error message
 *   and metadata include the failing service name and the underlying error message.
 */

async function validateServices(container: IContainer<ServiceMap, Token>, logger: ILogger) {
  const ctxLogger = withLoggerContext(logger, 'validateServices');

  ctxLogger.info(`Validating ${criticalServices.length} critical services...`);

  for (const service of criticalServices) {
    try {
      if (!container.isRegistered(service as Token)) throw new Error(`Service ${service} is not registered`);

      const resolved = container.resolve(service as Token);
      if (!resolved) throw new Error(`Service ${service} resolved to null/undefined`);

      logger.debug(`Service ${service} validate successfully`);
    } catch (error) {
      logger.error(`Service ${service} validation failed`, { serviceName: service, error: getErrorMessage(error) });
      throw new BootstrapError(`Critical service validation failed: ${service} - ${getErrorMessage(error)}`, {
        serviceName: service,
        originalError: getErrorMessage(error),
      });
    }
  }
}
