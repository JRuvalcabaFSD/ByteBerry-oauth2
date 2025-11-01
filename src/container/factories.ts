import { GracefulShutdown, HealthController, HttpServer, WinstonLoggerService } from '@/infrastructure';
import { IContainer } from '@/interfaces';

/**
 * Factory function to create a WinstonLoggerService instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of WinstonLoggerService with resolved Config and Clock dependencies
 */

export function createWinstonLoggerService(c: IContainer): WinstonLoggerService {
  return new WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
}

/**
 * Factory function that creates and configures a GracefulShutdown instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of GracefulShutdown configured with a Logger from the container
 *
 * @example
 * ```typescript
 * const gracefulShutdown = createGracefulShutdown(container);
 * ```
 */

export function createGracefulShutdown(c: IContainer): GracefulShutdown {
  return new GracefulShutdown(c.resolve('Logger'));
}

/**
 * Factory function that creates and returns a new HttpServer instance.
 *
 * @param c - The dependency injection container used to resolve HttpServer dependencies
 * @returns A new instance of HttpServer
 *
 * @example
 * ```typescript
 * const container = createContainer();
 * const httpServer = createHttpServer(container);
 * ```
 */

export function createHttpServer(c: IContainer): HttpServer {
  return new HttpServer(c);
}

/**
 * Creates and returns a new instance of the HealthController.
 *
 * @param c - The dependency injection container that provides required dependencies
 * @returns A new HealthController instance initialized with the provided container
 */

export function createHealthController(c: IContainer): HealthController {
  return new HealthController(c);
}
