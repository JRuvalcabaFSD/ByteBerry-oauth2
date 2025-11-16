import { ExchangeCodeForTokenUseCase, GenerateAuthorizationCodeUseCase, GetJwksUseCase } from '@/application';
import * as infrastructure from '@/infrastructure';
import { ICodeStore, IContainer, IExchangeCodeForTokenUseCase, IGenerateAuthorizationCodeUseCase } from '@/interfaces';
import { AuthorizeController, JWksController, PkceVerifierService, TokenController } from '@/presentation';

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
 * Creates an instance of an in-memory code store.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns An implementation of ICodeStore that stores authorization codes in memory
 *
 * @remarks
 * This factory function instantiates an InMemoryCodeStore with a logger resolved from the container.
 * The in-memory implementation is suitable for development and testing purposes, but should be
 * replaced with a persistent storage solution for production environments.
 */

export function createCodeStore(c: IContainer): ICodeStore {
  return new infrastructure.InMemoryCodeStore(c.resolve('Logger'));
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
  return new GenerateAuthorizationCodeUseCase(c.resolve('CodeStore'), c.resolve('Logger'));
}

/**
 * Factory function that creates and returns an instance of ExchangeCodeForTokenUseCase.
 *
 * @param c - The dependency injection container used to resolve required dependencies
 * @returns An instance of IExchangeCodeForTokenUseCase configured with resolved CodeStore and Logger dependencies
 */

export function createExchangeCodeForTokenUseCase(c: IContainer): IExchangeCodeForTokenUseCase {
  return new ExchangeCodeForTokenUseCase(
    c.resolve('CodeStore'),
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
  return new infrastructure.JwtService(c.resolve('Config').serviceName, c.resolve('KeyProvider'), c.resolve('Logger'));
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
