import * as Constructors from '@infrastructure';
import * as Interfaces from '@interfaces';
import { Config } from '@config';

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
 * Creates and returns a new instance of `HttpServer` using the provided container.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer`.
 * @returns An instance of `Interfaces.IHttpServer` initialized with the given container.
 */

export function createHttpServer(c: Interfaces.IContainer): Interfaces.IHttpServer {
	return new Constructors.HttpServer(c);
}
