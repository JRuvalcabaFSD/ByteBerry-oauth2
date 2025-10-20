import { ServiceMap } from '@/container/tokens';
import { GracefulShutdown, HttpServer, WinstonLoggerService } from '@/infrastructure';
import { IContainer } from '@/interfaces';

/**
 * Factory that constructs a WinstonLoggerService using dependencies provided by the container.
 *
 * Resolves the 'Config' and 'Clock' services from the given container and returns a new
 * WinstonLoggerService instance configured with those dependencies.
 *
 * @param c - An IoC container implementing resolution for the ServiceMap keys (must provide 'Config' and 'Clock').
 * @returns A fully constructed WinstonLoggerService.
 * @throws {Error} If required dependencies ('Config' or 'Clock') cannot be resolved from the container.
 * @example
 * const logger = createWinstonLoggerService(container);
 */

export function createWinstonLoggerService(c: IContainer<ServiceMap>): WinstonLoggerService {
  return new WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
}

/**
 * Create a GracefulShutdown helper using services from the given container.
 *
 * Resolves the 'Logger' service from the provided IContainer<ServiceMap> and
 * constructs a new GracefulShutdown instance with it.
 *
 * @param c - The dependency injection container used to resolve services.
 * @returns A new GracefulShutdown instance wired with the container's Logger.
 * @throws If the 'Logger' service cannot be resolved from the container.
 */

export function createGracefulShutdown(c: IContainer<ServiceMap>): GracefulShutdown {
  return new GracefulShutdown(c.resolve('Logger'));
}

/**
 * Create a new HttpServer instance using the given dependency container.
 *
 * This factory resolves the services required by the HttpServer from the
 * provided IContainer<ServiceMap> and returns a configured HttpServer.
 *
 * @param c - The dependency container (IContainer<ServiceMap>) used to resolve services required by the server.
 * @returns A newly constructed HttpServer configured with dependencies from the container.
 */

export function createHttpServer(c: IContainer<ServiceMap>): HttpServer {
  return new HttpServer(c);
}
