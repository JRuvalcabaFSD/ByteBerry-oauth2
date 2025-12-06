import { ClockService, GracefulShutdown, HealthService, HttpServer, UuidService, WinstonLoggerService } from '@infrastructure';
import { IClock, IConfig, IContainer, IHealthService, IHttpServer, ILogger, IUuid } from '@interfaces';
import { Config } from '@config';

/**
 * Creates and returns a new instance of the Config class.
 *
 * @returns {Config} A new Config instance
 *
 * @example
 * ```typescript
 * const config = createConfig();
 * ```
 */

export const createConfig = (): IConfig => new Config();

/**
 * Factory function that creates and returns a new instance of ClockService.
 *
 * @returns {ClockService} A new ClockService instance
 *
 * @example
 * ```ts
 * const clockService = createClockService();
 * ```
 */

export const createClockService = (): IClock => new ClockService();

/**
 * Creates and returns a new instance of the UUID service.
 *
 * @returns {IUuid} A new UUID service instance that implements the IUuid interface.
 *
 * @example
 * ```ts
 * const uuidService = createUuidService();
 * const newId = uuidService.generate();
 * ```
 */

export const createUuidService = (): IUuid => new UuidService();

/**
 * Factory function that creates and configures a Winston logger service instance.
 *
 * @param c - The dependency injection container used to resolve required dependencies
 * @returns A configured instance of the Winston logger service implementing the ILogger interface
 *
 * @remarks
 * This factory resolves the 'Config' and 'Clock' dependencies from the container
 * and injects them into the WinstonLoggerService constructor.
 */

export function createWintonLoggerService(c: IContainer): ILogger {
	return new WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
}

/**
 * Factory function that creates and configures a GracefulShutdown instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of GracefulShutdown initialized with a Logger from the container
 *
 * @remarks
 * This factory function follows the dependency injection pattern by resolving
 * the Logger dependency from the provided container before instantiating GracefulShutdown.
 */

export function createGracefulShutdown(c: IContainer): GracefulShutdown {
	return new GracefulShutdown(c.resolve('Logger'));
}

/**
 * Creates and returns a new HTTP server instance.
 *
 * @param c - The dependency injection container used to initialize the HTTP server
 * @returns A new instance of IHttpServer
 *
 * @example
 * ```typescript
 * const container = createContainer();
 * const server = createHttpServer(container);
 * ```
 */

export function createHttpServer(c: IContainer): IHttpServer {
	return new HttpServer(c);
}

/**
 * Factory function that creates and returns a new instance of HealthService.
 *
 * @param c - The dependency injection container that provides required dependencies
 * @returns A new instance of IHealthService
 */

export function createHealthService(c: IContainer): IHealthService {
	return new HealthService(c);
}
