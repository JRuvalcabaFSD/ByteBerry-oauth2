import {
	ClockService,
	GracefulShutdown,
	HealthService,
	HttpServer,
	InMemoryAuthCodeRepository,
	MockOAuthClientRepository,
	UuidService,
	WinstonLoggerService,
} from '@infrastructure';
import {
	IAuthCodeRepository,
	IClock,
	IConfig,
	IContainer,
	IGenerateAuthCodeUseCase,
	IHealthService,
	IHttpServer,
	ILogger,
	IOAthClientRepository,
	IUuid,
	IValidateClientUseCase,
} from '@interfaces';
import { Config } from '@config';
import { GenerateAuthCodeUseCase, ValidateClientUseCase } from '@application';
import { AuthorizationController } from '@presentation';

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

export function createGenerateAuthCodeUseCase(c: IContainer): IGenerateAuthCodeUseCase {
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

export function createValidateClientUseCase(c: IContainer): IValidateClientUseCase {
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
export function createAuthCodeRepository(c: IContainer): IAuthCodeRepository {
	return new InMemoryAuthCodeRepository();
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
export function createOAuthClientRepository(c: IContainer): IOAthClientRepository {
	return new MockOAuthClientRepository();
}

/**
 * Factory function that creates and returns an AuthorizationController instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of AuthorizationController with resolved dependencies
 */

export function createAuthController(c: IContainer): AuthorizationController {
	return new AuthorizationController(c.resolve('GenerateAuthCodeUseCase'));
}
