import * as Constructors from '@infrastructure';
import * as Interfaces from '@interfaces';
import { Config } from '@config';
import { InMemoryUserRepository } from '@infrastructure';

/**
 * Creates and returns a new instance of the `Config` class implementing the `IConfig` interface.
 *
 * @returns {IConfig} A new configuration object.
 */

export const createConfig = (): Interfaces.IConfig => new Config();

/**
 * Factory function to create a new instance of the `ClockService` implementing the `IClock` interface.
 *
 * @returns {IClock} A new instance of `ClockService`.
 */

export const createClockService = (): Interfaces.IClock => new Constructors.ClockService();

/**
 * Factory function that creates and returns a new instance of the `UuidService` implementing the `IUuid` interface.
 *
 * @returns {IUuid} A new instance of `UuidService`.
 */

export const createUuidService = (): Interfaces.IUuid => new Constructors.UuidService();

/**
 * Factory function to create an instance of the WinstonLoggerService.
 *
 * @param c - The dependency injection container used to resolve required dependencies.
 * @returns An instance of ILogger implemented by WinstonLoggerService.
 *
 * @remarks
 * This function resolves the 'Config' and 'Clock' dependencies from the container
 * and passes them to the WinstonLoggerService constructor.
 */

export function createLoggerService(c: Interfaces.IContainer): Interfaces.ILogger {
	return new Constructors.WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
}

/**
 * Creates and returns a new instance of `HttpServer` using the provided container.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer`.
 * @returns An instance of `Interfaces.IHttpServer` initialized with the given container.
 */

export function createHttpServer(c: Interfaces.IContainer): Interfaces.IHttpServer {
	return new Constructors.HttpServer(c);
}

/**
 * Factory function to create an instance of `IHealthService`.
 *
 * @param c - The dependency injection container implementing `IContainer`.
 * @returns An instance of `IHealthService`.
 */

export function createHealthService(c: Interfaces.IContainer): Interfaces.IHealthService {
	return new Constructors.HealthService(c);
}

/**
 * Factory function to create an instance of {@link Interfaces.IUserRepository}.
 *
 * @param c - The dependency injection container instance.
 * @returns An implementation of {@link Interfaces.IUserRepository} using in-memory storage.
 */

export function createUserRepository(): Interfaces.IUserRepository {
	return new InMemoryUserRepository();
}

/**
 * Creates and returns an instance of `ISessionRepository` using the in-memory implementation.
 *
 * @param c - The dependency injection container used to resolve required dependencies.
 * @returns An instance of `ISessionRepository` backed by an in-memory store.
 */

export function createSessionRepository(c: Interfaces.IContainer): Interfaces.ISessionRepository {
	return new Constructors.InMemorySessionRepository(c.resolve('Logger'));
}
