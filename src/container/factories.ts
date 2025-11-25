import { ExchangeCodeForTokenUseCase, GenerateAuthorizationCodeUseCase, GetJwksUseCase } from '@/application';
import { DatabaseConfig } from '@/config/database.config';
import * as infrastructure from '@/infrastructure';
import {
  IAuthCodeMappers,
  IAuthorizationCodeRepository,
  IContainer,
  IExchangeCodeForTokenUseCase,
  IGenerateAuthorizationCodeUseCase,
} from '@/interfaces';
import { AuthorizeController, JWksController, PkceVerifierService, TokenController } from '@/presentation';
import { PrismaClient } from 'generated/prisma/client';

/**
 * Creates an instance of `EnvKeyProvider` using the provided container.
 *
 * @param c - The dependency injection container used to resolve required configuration.
 * @returns An `EnvKeyProvider` initialized with the resolved configuration.
 */

export function createKeyProvider(c: IContainer): infrastructure.EnvKeyProvider {
  return new infrastructure.EnvKeyProvider(c.resolve('Config'));
}

/**
 * Factory function to create a WinstonLoggerService instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of WinstonLoggerService with resolved Config and Clock dependencies
 */

export function createWinstonLoggerService(c: IContainer): infrastructure.WinstonLoggerService {
  return new infrastructure.WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
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

export function createGracefulShutdown(c: IContainer): infrastructure.GracefulShutdown {
  return new infrastructure.GracefulShutdown(c.resolve('Logger'));
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

export function createHttpServer(c: IContainer): infrastructure.HttpServer {
  return new infrastructure.HttpServer(c);
}

/**
 * Creates and returns a new instance of the HealthService.
 *
 * @param c - The dependency injection container that provides required dependencies
 * @returns A new HealthService instance initialized with the provided container
 */

export function createHealthService(c: IContainer): infrastructure.HealthService {
  return new infrastructure.HealthService(c);
}

/**
 * Creates and returns an instance of the GenerateAuthorizationCodeUseCase.
 *
 * This factory function resolves the required dependencies from the provided container
 * and instantiates a new GenerateAuthorizationCodeUseCase with them.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of IGenerateAuthorizationCodeUseCase
 *
 * @remarks
 * This function resolves the following dependencies from the container:
 * - 'CodeStore': The storage mechanism for authorization codes
 * - 'Logger': The logging utility for the use case
 */

export function createGenerateAuthorizationCodeUseCase(c: IContainer): IGenerateAuthorizationCodeUseCase {
  return new GenerateAuthorizationCodeUseCase(c.resolve('AuthorizationCodeRepository'), c.resolve('Logger'));
}

/**
 * Factory function that creates and returns an instance of ExchangeCodeForTokenUseCase.
 *
 * @param c - The dependency injection container used to resolve required dependencies
 * @returns An instance of IExchangeCodeForTokenUseCase configured with resolved CodeStore and Logger dependencies
 */

export function createExchangeCodeForTokenUseCase(c: IContainer): IExchangeCodeForTokenUseCase {
  return new ExchangeCodeForTokenUseCase(
    c.resolve('AuthorizationCodeRepository'),
    c.resolve('Logger'),
    c.resolve('JwtService'),
    c.resolve('PkceVerifierService')
  );
}

/**
 * Factory function that creates and returns an instance of AuthorizeController.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of AuthorizeController with its required dependencies injected
 *
 * @remarks
 * This factory function resolves the 'GenerateAuthorizationCodeUseCase' dependency
 * from the provided container and injects it into the AuthorizeController constructor.
 */

export function createAuthorizeController(c: IContainer): AuthorizeController {
  return new AuthorizeController(c.resolve('GenerateAuthorizationCodeUseCase'));
}

/**
 * Creates and configures a TokenController instance with its required dependencies.
 *
 * @param c - The dependency injection container used to resolve the ExchangeCodeForTokenUseCase
 * @returns A new TokenController instance with the resolved use case dependency
 *
 * @remarks
 * This factory function follows the Dependency Injection pattern, using the container
 * to resolve and inject the ExchangeCodeForTokenUseCase into the TokenController.
 */

export function createTokenController(c: IContainer): TokenController {
  return new TokenController(c.resolve('ExchangeCodeForTokenUseCase'));
}

/**
 * Creates and returns a new instance of the JWksController.
 *
 * @returns {JWksController} A new JWksController instance
 */

export function createJwksController(c: IContainer): JWksController {
  return new JWksController(c.resolve('GetJwksUseCase'));
}

/**
 * Factory function to create an instance of {@link PkceVerifierService}.
 *
 * @param c - The dependency injection container used to resolve required dependencies.
 * @returns A new instance of {@link PkceVerifierService} initialized with the resolved 'Hash' service.
 */

export function createPkceVerifierService(c: IContainer): PkceVerifierService {
  return new PkceVerifierService(c.resolve('Hash'), c.resolve('Logger'));
}

/**
 * Factory function to create an instance of `JwtService`.
 *
 * @param c - The dependency injection container used to resolve required services.
 * @returns A new instance of `infrastructure.JwtService` initialized with the service name, key provider, and logger.
 */

export function createJwtService(c: IContainer): infrastructure.JwtService {
  const { oauth2Issuer, jwtAudience, tokenExpiresIn } = c.resolve('Config');
  return new infrastructure.JwtService(oauth2Issuer, tokenExpiresIn, jwtAudience, c.resolve('KeyProvider'), c.resolve('Logger'));
}

/**
 * Creates an instance of {@link infrastructure.JwksService} using the provided container.
 *
 * This factory function resolves the `KeyProvider` from the given container,
 * retrieves the public key and key ID, and constructs a new `JwksService`.
 *
 * @param c - The dependency injection container used to resolve required services.
 * @returns A new instance of {@link infrastructure.JwksService} initialized with the public key and key ID.
 */

export function createJwksService(c: IContainer): infrastructure.JwksService {
  const provider = c.resolve('KeyProvider');
  return new infrastructure.JwksService(provider.getPublicKey(), provider.getKeyId());
}

/**
 * Creates an instance of `GetJwksUseCase` using the provided container.
 *
 * Resolves the `JwksService` dependency from the container and injects it into the use case.
 *
 * @param c - The dependency injection container used to resolve required services.
 * @returns A new instance of `GetJwksUseCase` initialized with the resolved `JwksService`.
 */

export function createGetJwksUseCase(c: IContainer): GetJwksUseCase {
  return new GetJwksUseCase(c.resolve('JwksService'));
}

/**
 * Factory function to create and return a singleton instance of {@link DatabaseConfig}.
 *
 * @param c - The dependency injection container used to resolve configuration values.
 * @returns The singleton {@link DatabaseConfig} instance initialized with the database URL from the configuration.
 */

export function createDatabaseConfig(c: IContainer): DatabaseConfig {
  return DatabaseConfig.getInstance(c.resolve('Config').databaseUrl);
}

/**
 * Creates and returns a PrismaClient instance using the provided container.
 *
 * @param c - The dependency injection container implementing `IContainer`.
 * @returns A configured `PrismaClient` instance.
 */

export function createDbClient(c: IContainer): PrismaClient {
  return c.resolve('DatabaseConfig').getClient();
}

/**
 * Factory function that creates and returns an instance of `IAuthCodeMappers`.
 *
 * @returns {IAuthCodeMappers} An instance of `AuthCodeMapper` from the infrastructure layer.
 */

export function createAuthCodeMapper(): IAuthCodeMappers {
  return new infrastructure.AuthCodeMapper();
}

/**
 * Creates and returns an instance of `IAuthorizationCodeRepository` using the provided container.
 *
 * This factory function resolves the required dependencies from the given `IContainer`:
 * - `AuthCodeMappers`: Used for mapping authorization code data.
 * - `DbClient`: Database client for data persistence.
 * - `Logger`: Logger instance for logging operations.
 *
 * @param c - The dependency injection container used to resolve required dependencies.
 * @returns An instance of `IAuthorizationCodeRepository` backed by a database implementation.
 */

export function createAuthorizationCodeRepository(c: IContainer): IAuthorizationCodeRepository {
  return new infrastructure.DatabaseAuthorizationCodeRepository(c.resolve('AuthCodeMappers'), c.resolve('DbClient'), c.resolve('Logger'));
}
