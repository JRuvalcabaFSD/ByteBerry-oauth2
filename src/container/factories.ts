import * as Constructors from '@infrastructure';
import * as Interfaces from '@interfaces';

import { InMemoryAuthCodeRepository, InMemoryUserRepository, NodeHashService } from '@infrastructure';
import {
	ExchangeTokenUseCase,
	GenerateAuthCodeUseCase,
	GetJwksUseCase,
	LoginUseCase,
	PkceVerifierUseCase,
	ValidateClientUseCase,
} from '@application';
import { AuthCodeController, JwksController, LoginController, TokenController } from '@presentation';
import { Config, DatabaseConfig } from '@config';

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

/**
 * Creates and returns a new instance of an in-memory implementation of the `IAuthCodeRepository` interface.
 *
 * @param c - The dependency injection container used to resolve required dependencies. *
 * @returns {Interfaces.IAuthCodeRepository} An instance of `InMemoryAuthCodeRepository` for managing authorization codes in memory.
 */

export function createAuthCodeRepository(): Interfaces.IAuthCodeRepository {
	return new InMemoryAuthCodeRepository();
}

/**
 * Factory function to create an instance of `ILoginUseCase`.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer`.
 *            Used to resolve required dependencies for the `LoginUseCase`.
 * @returns An instance of `ILoginUseCase` initialized with the resolved dependencies.
 *
 * @remarks
 * This function resolves the following dependencies from the container:
 * - `SessionRepository`
 * - `UserRepository`
 * - `UUid`
 * - `Logger`
 *
 * These dependencies are injected into the `LoginUseCase` constructor.
 */

export function createLoginUseCase(c: Interfaces.IContainer): Interfaces.ILoginUseCase {
	return new LoginUseCase(c.resolve('SessionRepository'), c.resolve('UserRepository'), c.resolve('UUid'), c.resolve('Logger'));
}

/**
 * Factory function to create an instance of {@link LoginController}.
 *
 * @param c - The dependency injection container implementing {@link Interfaces.IContainer}.
 *            Used to resolve required dependencies for the controller.
 * @returns A new instance of {@link LoginController} with its dependencies injected.
 */

export function createLoginController(c: Interfaces.IContainer): LoginController {
	return new LoginController(c.resolve('LoginUserCase'), c.resolve('Logger'), c.resolve('Config'));
}

/**
 * Creates and returns an instance of an in-memory implementation of the `IOAuthClientRepository`.
 *
 * @param c - The dependency injection container implementing {@link Interfaces.IContainer}.
 *            Used to resolve required dependencies for the controller.
 * @returns {Interfaces.IOAuthClientRepository} An in-memory OAuth client repository instance.
 */
export function createOAuthClientRepository(): Interfaces.IOAuthClientRepository {
	return new Constructors.InMemoryOAuthClientRepository();
}

/**
 * Factory function to create an instance of `IGenerateAuthCodeUseCase`.
 *
 * This function resolves the required dependencies from the provided container,
 * including the authorization code repository, client validation use case, logger,
 * and the configuration value for authorization code expiration.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer`.
 * @returns An instance of `IGenerateAuthCodeUseCase`.
 */

export function createGenerateAuthCodeUseCase(c: Interfaces.IContainer): Interfaces.IGenerateAuthCodeUseCase {
	const { authCodeExpiresInMinutes } = c.resolve('Config');
	return new GenerateAuthCodeUseCase(
		c.resolve('AuthCodeRepository'),
		c.resolve('ValidateClientUseCase'),
		c.resolve('Logger'),
		authCodeExpiresInMinutes
	);
}

/**
 * Factory function to create an instance of `IValidateClientUseCase`.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer`.
 *            Used to resolve required dependencies for the use case.
 * @returns An instance of `IValidateClientUseCase` initialized with the resolved
 *          `OAuthClientRepository` and `Logger` dependencies.
 */

export function createValidateClientUseCase(c: Interfaces.IContainer): Interfaces.IValidateClientUseCase {
	return new ValidateClientUseCase(c.resolve('OAuthClientRepository'), c.resolve('Logger'));
}

/**
 * Factory function to create an instance of {@link AuthCodeController}.
 *
 * @param c - The dependency injection container implementing {@link Interfaces.IContainer}.
 * @returns An initialized {@link AuthCodeController} with its dependencies resolved.
 */

export function createAuthCodeController(c: Interfaces.IContainer): AuthCodeController {
	return new AuthCodeController(c.resolve('GenerateAuthCodeUseCase'));
}

/**
 * Factory function that creates and returns an instance of a class implementing the `IHashService` interface.
 *
 * @returns {Interfaces.IHashService} An instance of `NodeHashService` that provides hashing functionalities.
 */
export function createHashService(): Interfaces.IHashService {
	return new NodeHashService();
}

/**
 * Factory function to create an instance of `PkceVerifierUseCase`.
 *
 * @param c - The dependency injection container providing required services.
 * @returns An initialized `IPkceVerifierUseCase` with injected `HashService` and `Logger`.
 */

export function createPKCEVerifierUseCase(c: Interfaces.IContainer): Interfaces.IPkceVerifierUseCase {
	return new PkceVerifierUseCase(c.resolve('HashService'), c.resolve('Logger'));
}

/**
 * Factory function to create an instance of {@link Constructors.KeyLoader}.
 *
 * @param c - The dependency injection container used to resolve required dependencies.
 * @returns An instance of {@link Constructors.KeyLoader} initialized with the resolved configuration.
 */

export function createKeyLoaderService(c: Interfaces.IContainer): Constructors.KeyLoader {
	return new Constructors.KeyLoader(c.resolve('Config'));
}

/**
 * Factory function to create an instance of `IJwtService`.
 *
 * @param c - The dependency injection container used to resolve required services.
 * @returns An instance of `IJwtService` initialized with configuration, key loader, and logger services.
 */

export function createJwtService(c: Interfaces.IContainer): Interfaces.IJwtService {
	return new Constructors.JwtService(c.resolve('Config'), c.resolve('KeyLoaderService'), c.resolve('Logger'));
}

/**
 * Factory function to create an instance of {@link Interfaces.IExchangeTokenUseCase}.
 *
 * @param c - The dependency injection container implementing {@link Interfaces.IContainer}.
 * @returns An instance of {@link Interfaces.IExchangeTokenUseCase}.
 */

export function createExchangeTokenUseCase(c: Interfaces.IContainer): Interfaces.IExchangeTokenUseCase {
	return new ExchangeTokenUseCase(c);
}

/**
 * Factory function to create an instance of {@link TokenController}.
 *
 * @param c - The dependency injection container implementing {@link Interfaces.IContainer}.
 * @returns A new instance of {@link TokenController} with the required dependencies resolved.
 */

export function createTokenController(c: Interfaces.IContainer): TokenController {
	return new TokenController(c.resolve('ExchangeTokenUseCase'));
}

/**
 * Creates an instance of `IJwksService` using the provided dependency injection container.
 *
 * This factory function resolves the `KeyLoaderService` from the container to obtain
 * the public key and key ID, which are then used to construct a new `JwksService`.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer`.
 * @returns An instance of `Interfaces.IJwksService` initialized with the resolved public key and key ID.
 */

export function createJwksService(c: Interfaces.IContainer): Interfaces.IJwksService {
	const keys = c.resolve('KeyLoaderService');
	const publicKey = keys.getPublicKey();
	const keyId = keys.getKeyId();
	return new Constructors.JwksService(publicKey, keyId);
}

/**
 * Factory function to create an instance of `GetJwksUseCase`.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer`.
 *            It is expected to provide a `JwksService` instance when resolved.
 * @returns A new instance of `GetJwksUseCase` initialized with the resolved `JwksService`.
 */

export function createGetJwksUseCase(c: Interfaces.IContainer): Interfaces.IGetJwksUseCase {
	return new GetJwksUseCase(c.resolve('JwksService'));
}

/**
 * Factory function to create an instance of {@link JwksController}.
 *
 * @param c - The dependency injection container used to resolve dependencies.
 * @returns A new instance of {@link JwksController} initialized with the resolved `GetJWksUseCase`.
 */

export function createJwksController(c: Interfaces.IContainer): JwksController {
	return new JwksController(c.resolve('GetJWksUseCase'));
}

/**
 * Creates a new instance of the `GracefulShutdown` class using the provided dependency injection container.
 *
 * @param c - The dependency injection container implementing `Interfaces.IContainer` used to resolve dependencies.
 * @returns An instance of `Constructors.GracefulShutdown`.
 */

export function createGracefulShutdown(c: Interfaces.IContainer): Constructors.GracefulShutdown {
	return new Constructors.GracefulShutdown(c.resolve('Logger'));
}

/**
 * Creates and returns a new instance of {@link DatabaseConfig} using configuration values
 * resolved from the provided dependency injection container.
 *
 * @param c - The dependency injection container implementing {@link Interfaces.IContainer}.
 * @returns A configured {@link DatabaseConfig} instance.
 *
 * @remarks
 * This factory function extracts the database connection string and pool settings from the
 * container's 'Config' service, and the logger from the 'Logger' service, to initialize
 * the database configuration.
 */

export function createDBConfig(c: Interfaces.IContainer): DatabaseConfig {
	const { databaseUrl, databasePoolMax, databasePoolMin } = c.resolve('Config');
	return new DatabaseConfig({ connectionString: databaseUrl, pollMax: databasePoolMax, poolMin: databasePoolMin }, c.resolve('Logger'));
}
