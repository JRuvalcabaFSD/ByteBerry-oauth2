import { TOKENS } from '@/container';
import { HealthController, HttpServer, WinstonLoggerService } from '@/infrastructure';
import { IContainer } from '@/interfaces';

/**
 * Creates a WinstonLoggerService using dependencies resolved from the provided container.
 *
 * @param c - The inversion-of-control container used to resolve the configuration and clock dependencies.
 * @returns A configured WinstonLoggerService instance.
 *
 * @remarks
 * Internally resolves TOKENS.Config and TOKENS.Clock from the container and passes them to the
 * WinstonLoggerService constructor.
 */

export function createWinstonLoggerService(c: IContainer): WinstonLoggerService {
  return new WinstonLoggerService(c.resolve(TOKENS.Config), c.resolve(TOKENS.Clock));
}

/**
 * Factory function that creates and configures an HttpServer instance.
 *
 * @param c - The dependency injection container used to resolve required dependencies
 * @returns A new HttpServer instance with resolved dependencies for Config, Logger, Uuid, and Clock
 */

export function createHttpServer(c: IContainer): HttpServer {
  return new HttpServer(
    c.resolve(TOKENS.Config),
    c.resolve(TOKENS.Logger),
    c.resolve(TOKENS.Uuid),
    c.resolve(TOKENS.Clock),
    c.resolve(TOKENS.HealthController)
  );
}

/**
 * Creates a HealthController instance by resolving its dependencies from the given IoC container.
 *
 * The following tokens must be registered in the container:
 * - TOKENS.Config
 * - TOKENS.Logger
 * - TOKENS.Uuid
 * - TOKENS.Clock
 *
 * @param c - The inversion-of-control container used to resolve dependencies.
 * @returns A fully initialized HealthController.
 * @throws Error If any required dependency cannot be resolved from the container.
 * @remarks Ensure all required tokens are bound in the container before invoking this factory.
 */

export function createHealthController(c: IContainer): HealthController {
  return new HealthController(c, c.resolve(TOKENS.Config), c.resolve(TOKENS.Logger), c.resolve(TOKENS.Uuid), c.resolve(TOKENS.Clock));
}
