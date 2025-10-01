import { TOKENS } from '@/container';
import { HttpServer, WinstonLoggerService } from '@/infrastructure';
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
  return new HttpServer(c.resolve(TOKENS.Config), c.resolve(TOKENS.Logger), c.resolve(TOKENS.Uuid), c.resolve(TOKENS.Clock));
}
