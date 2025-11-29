import { bootstrapContainer, criticalServices, Token } from '@/container';
import { configureShutdown, GracefulShutdown } from '@/infrastructure';
import { IContainer, ILogger } from '@/interfaces';
import { BootstrapError, getErrMsg, withLoggerContext, wrapContainerLogger } from '@/shared';

/**
 * Represents the result of the application bootstrap process.
 *
 * @remarks
 * This interface encapsulates the initialized dependency injection container
 * and the graceful shutdown handler that are created during application startup.
 *
 * @property container - The initialized dependency injection container that holds all registered services and dependencies
 * @property shutdown - The graceful shutdown handler responsible for cleanly terminating application resources
 */

export interface BootstrapResult {
  container: IContainer;
  shutdown: GracefulShutdown;
}

/**
 * Bootstraps the application by initializing the dependency injection container,
 * configuring services, and starting the HTTP server.
 *
 * @returns A Promise that resolves to a {@link BootstrapResult} containing the initialized
 * container and a shutdown function for graceful termination.
 *
 * @throws {BootstrapError} If the bootstrap process fails at any stage, including
 * container initialization, service validation, or HTTP server startup. The error
 * includes details about the failure phase and original error message.
 *
 * @remarks
 * The bootstrap process performs the following steps:
 * 1. Wraps the bootstrap container with logging capabilities
 * 2. Resolves the logger instance for application-wide logging
 * 3. Configures graceful shutdown handlers
 * 4. Validates all registered services
 * 5. Starts the HTTP server
 *
 * If an error occurs before the logger is available, it falls back to console.error.
 *
 * @example
 * ```typescript
 * const { container, shutdown } = await bootstrap();
 * // Use container to resolve services
 * // Call shutdown() when terminating the application
 * ```
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
    await validateDbConnection(container, logger);
    await httpServer.start();

    return { container, shutdown };
  } catch (error) {
    if (logger) {
      logger.error('Service failed', {
        error: getErrMsg(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    } else {
      // eslint-disable-next-line no-console
      console.error('Bootstrap failed before logger was available:', getErrMsg(error));
    }

    throw new BootstrapError(`Service bootstrap failed: ${getErrMsg(error)}`, {
      originalError: getErrMsg(error),
      phase: 'bootstrap',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Validates that all critical services are properly registered and resolvable in the dependency injection container.
 *
 * @param container - The dependency injection container to validate services against
 * @param logger - Logger instance for recording validation progress and errors
 *
 * @throws {BootstrapError} Throws when a critical service is not registered, fails to resolve, or resolves to null/undefined
 *
 * @remarks
 * This function iterates through all services defined in the `criticalServices` array and performs the following checks:
 * - Verifies the service is registered in the container
 * - Attempts to resolve the service from the container
 * - Ensures the resolved service is not null or undefined
 *
 * If any validation step fails, a detailed error is logged and a `BootstrapError` is thrown with context about the failing service.
 *
 * @internal
 */

async function validateServices(container: IContainer, logger: ILogger) {
  const ctxLogger = withLoggerContext(logger, 'bootstrap.validateServices');

  ctxLogger.info(`Validating ${criticalServices.length} critical services...`);

  for (const service of criticalServices) {
    try {
      if (!container.isRegistered(service as Token)) throw new Error(`Service ${service} is not registered`);

      const resolved = container.resolve(service as Token);
      if (!resolved) throw new Error(`Service ${service} resolved to null/undefined`);

      logger.debug(`Service ${service} validate successfully`);
    } catch (error) {
      logger.error(`Service ${service} validation failed`, { serviceName: service, error: getErrMsg(error) });
      throw new BootstrapError(`Critical service validation failed: ${service} - ${getErrMsg(error)}`, {
        serviceName: service,
        originalError: getErrMsg(error),
      });
    }
  }
}

/**
 * Validates the database connection by attempting to test the connection using the provided container.
 * Logs an error and throws a `BootstrapError` if the connection fails.
 *
 * @param container - The dependency injection container used to resolve the database configuration.
 * @param logger - The logger instance used for logging context and errors.
 * @throws {BootstrapError} If the database connection test fails.
 */

async function validateDbConnection(container: IContainer, logger: ILogger) {
  const ctxLogger = withLoggerContext(logger, 'bootstrap.validateDbConnection');

  try {
    await container.resolve('DatabaseConfig').testConnection();
  } catch (error) {
    ctxLogger.error('Database connection failed', { error: getErrMsg(error) });
    throw new BootstrapError('Database connection failed', { error: getErrMsg(error) });
  }
}
