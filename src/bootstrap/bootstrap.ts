import { GracefulShutdown } from '@/bootstrap';
import { bootstrapContainer, criticalServices, TOKENS } from '@/container';
import { IContainer, IHttpServer, ILogger } from '@/interfaces';
import { BootstrapError } from '@/shared';

/**
 * Result object returned by the bootstrap process containing the dependency injection
 * container and graceful shutdown handler.
 *
 * @interface BootstrapResult
 * @property {IContainer} container - The dependency injection container instance
 * @property {GracefulShutdown} shutdown - Handler for graceful application shutdown
 */
export interface BootstrapResult {
  container: IContainer;
  shutdown: GracefulShutdown;
}

/**
 * Initializes and starts the application runtime.
 *
 * This bootstraps the dependency injection container, resolves core services
 * (logger, clock, HTTP server), validates required components, and starts the
 * HTTP server. It also wires a graceful shutdown routine that will stop the
 * HTTP server during application teardown.
 *
 * Remarks:
 * - Emits structured lifecycle logs for startup progress and completion.
 * - Validates critical services before accepting traffic.
 * - Registers a cleanup hook to stop the HTTP server gracefully.
 * - On failure, logs the error (or falls back to console if the logger is not yet available)
 *   and throws a BootstrapError enriched with context.
 *
 * Usage:
 * Call once during process startup; use the returned shutdown handle to coordinate
 * graceful termination.
 *
 * @returns Promise that resolves to a BootstrapResult containing the initialized container and a configured shutdown controller.
 * @throws {BootstrapError} If any step of the bootstrap process fails.
 * @see GracefulShutdown
 * @see IHttpServer
 * @see ILogger
 */
export async function bootstrap(): Promise<BootstrapResult> {
  let container: IContainer;
  let logger: ILogger | undefined;
  let httpServer: IHttpServer;

  try {
    container = bootstrapContainer();
    logger = container.resolve<ILogger>(TOKENS.Logger);
    httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);

    await validateServices(container, logger);

    logger.info('Application bootstrap started');
    const shutdown = new GracefulShutdown(logger);

    const loggerInstance = logger;
    shutdown.registerCleanup(async () => {
      loggerInstance.info('Stopping HTTP server...');
      await httpServer.stop();
    });

    await httpServer.start();

    logger.info('Application bootstrap completed successfully');

    return { container, shutdown };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (logger) {
      try {
        logger.error('Application bootstrap failed', {
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
      } catch {
        // eslint-disable-next-line no-console
        console.error('Logger failed:', errorMessage);
      }
    } else {
      // eslint-disable-next-line no-console
      console.error('Bootstrap failed before logger was available:', errorMessage);
    }

    throw new BootstrapError(`Application bootstrap failed: ${errorMessage}`, {
      originalError: errorMessage,
      phase: 'bootstrap',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Validate critical services are registered and can be resolved
 * @param {IContainer} container
 * @param {ILogger} logger
 */
async function validateServices(container: IContainer, logger: ILogger) {
  logger.info(`Validating ${criticalServices.length} critical services...`);

  for (const service of criticalServices) {
    try {
      if (!container.isRegistered(service.token)) {
        throw new Error(`Service ${service.name} is not registered`);
      }

      const resolved = container.resolve(service.token);
      if (!resolved) {
        throw new Error(`Service ${service.name} resolved to null/undefined`);
      }

      logger.debug(`Service ${service.name} validated successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Service ${service.name} validation failed`, {
        error: errorMessage,
        token: service.token.description,
      });
      throw new BootstrapError(`Critical service validation failed: ${service.name} - ${errorMessage}`, {
        serviceName: service.name,
        tokenDescription: service.token.description,
        originalError: errorMessage,
      });
    }
  }

  logger.info('All critical services validated successfully');
}
