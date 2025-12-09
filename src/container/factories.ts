import * as Services from '@infrastructure';
import * as Interfaces from '@interfaces';
import { Config } from '@config';
import { ExchangeCodeForTokenUseCase, GenerateAuthCodeUseCase, PkceVerifierService, ValidateClientUseCase } from '@application';
import { AuthorizationController, TokenController } from '@presentation';
import { TokenRepository } from 'src/infrastructure/repositories/token.repository.js';
import { NodeHashService } from 'src/infrastructure/services/sha256-hash.service.js';

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

export const createConfig = (): Interfaces.IConfig => new Config();

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

export const createClockService = (): Interfaces.IClock => new Services.ClockService();

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

export const createUuidService = (): Interfaces.IUuid => new Services.UuidService();

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

export function createWintonLoggerService(c: Interfaces.IContainer): Interfaces.ILogger {
	return new Services.WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
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

export function createGracefulShutdown(c: Interfaces.IContainer): Services.GracefulShutdown {
	return new Services.GracefulShutdown(c.resolve('Logger'));
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

export function createHttpServer(c: Interfaces.IContainer): Interfaces.IHttpServer {
	return new Services.HttpServer(c);
}

/**
 * Factory function that creates and returns a new instance of HealthService.
 *
 * @param c - The dependency injection container that provides required dependencies
 * @returns A new instance of IHealthService
 */

export function createHealthService(c: Interfaces.IContainer): Interfaces.IHealthService {
	return new Services.HealthService(c);
}

/**
 * Factory function that creates and configures a GenerateAuthCodeUseCase instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns An instance of IGenerateAuthCodeUseCase with all required dependencies injected
 *
 * @remarks
 * This factory resolves the following dependencies from the container:
 * - AuthCodeRepository: Repository for managing authorization codes
 * - ValidateClientUseCase: Use case for validating OAuth2 clients
 * - Logger: Logging service for operation tracking
 */

export function createGenerateAuthCodeUseCase(c: Interfaces.IContainer): Interfaces.IGenerateAuthCodeUseCase {
	return new GenerateAuthCodeUseCase(c.resolve('AuthCodeRepository'), c.resolve('ValidateClientUseCase'), c.resolve('Logger'));
}

/**
 * Creates and configures a new instance of ValidateClientUseCase.
 *
 * This factory function resolves the required dependencies from the container
 * and instantiates a ValidateClientUseCase with those dependencies.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of ValidateClientUseCase configured with:
 *          - OAuthClientRepository for client data access
 *          - Logger for logging operations
 *
 * @example
 * ```typescript
 * const container = createContainer();
 * const validateClientUseCase = createValidateClientUseCase(container);
 * ```
 */

export function createValidateClientUseCase(c: Interfaces.IContainer): Interfaces.IValidateClientUseCase {
	return new ValidateClientUseCase(c.resolve('OAuthClientRepository'), c.resolve('Logger'));
}

/**
 * Creates and returns an instance of an authorization code repository.
 *
 * @param c - The dependency injection container instance
 * @returns An in-memory implementation of the authorization code repository
 *
 * @remarks
 * This factory function is responsible for instantiating the auth code repository.
 * Currently returns an in-memory implementation for storing authorization codes.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createAuthCodeRepository(c: Interfaces.IContainer): Interfaces.IAuthCodeRepository {
	return new Services.InMemoryAuthCodeRepository();
}

/**
 * Creates and returns an instance of IOAthClientRepository.
 *
 * @param c - The dependency injection container instance
 * @returns A new instance of MockOAuthClientRepository implementing IOAthClientRepository
 *
 * @remarks
 * This factory function is used to instantiate the OAuth client repository.
 * Currently returns a mock implementation for testing purposes.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createOAuthClientRepository(c: Interfaces.IContainer): Interfaces.IOAthClientRepository {
	return new Services.MockOAuthClientRepository();
}

/**
 * Factory function that creates and returns an AuthorizationController instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of AuthorizationController with resolved dependencies
 */

export function createAuthController(c: Interfaces.IContainer): AuthorizationController {
	return new AuthorizationController(c.resolve('GenerateAuthCodeUseCase'));
}

export function createTokenRepository(c: Interfaces.IContainer): Interfaces.ITokenRepository {
	return new TokenRepository(c.resolve('Logger'));
}

export function createJwtService(c: Interfaces.IContainer): Interfaces.IJwtService {
	const { jwtIssuer, jwtAccessTokenExpiresIn, jwtAudience } = c.resolve('Config');
	return new Services.JwtService(jwtIssuer, jwtAccessTokenExpiresIn, jwtAudience, c.resolve('Logger'));
}

export function createPkceVerifierService(c: Interfaces.IContainer): Interfaces.IPKceVerifierService {
	return new PkceVerifierService(c.resolve('HashService'), c.resolve('Logger'));
}

export function createHashService(): Interfaces.IHashService {
	return new NodeHashService();
}

export function createExchangeCodeFotTokenUseCase(c: Interfaces.IContainer): Interfaces.IExchangeCodeForTokenUseCase {
	return new ExchangeCodeForTokenUseCase(
		c.resolve('AuthCodeRepository'),
		c.resolve('TokenRepository'),
		c.resolve('Logger'),
		c.resolve('JwtService'),
		c.resolve('PkceVerifierService')
	);
}

export function createTokenController(c: Interfaces.IContainer): TokenController {
	return new TokenController(c.resolve('ExchangeCodeFotTokenUseCase'));
}
