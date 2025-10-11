import * as usesCases from '@/application';
import * as services from '@/infrastructure';

import { TOKENS } from '@/container';
import { IContainer } from '@/interfaces';
import { JwtService } from '@/infrastructure/services/jwt.service';

/**
 * Creates a WinstonLoggerService using dependencies resolved from the provided container.
 *
 * @param c - The inversion-of-control container used to resolve the configuration and clock dependencies.
 * @returns A configured WinstonLoggerService instance.
 *
 * @remarks
 * Internally resolves TOKENS.Config and TOKENS.Clock from the container and passes them to the
 * WinstonLoggerService constructor.
 */

export function createWinstonLoggerService(c: IContainer): services.WinstonLoggerService {
  return new services.WinstonLoggerService(c.resolve(TOKENS.Config), c.resolve(TOKENS.Clock));
}

/**
 * Creates and returns a new instance of the `HttpServer` class, resolving all required dependencies
 * from the provided container.
 *
 * @param c - The dependency injection container used to resolve required services and controllers.
 * @returns A fully constructed `HttpServer` instance with all dependencies injected.
 */

export function createHttpServer(c: IContainer): services.HttpServer {
  return new services.HttpServer(
    c.resolve(TOKENS.Config),
    c.resolve(TOKENS.Logger),
    c.resolve(TOKENS.Uuid),
    c.resolve(TOKENS.Clock),
    c.resolve(TOKENS.HealthController),
    c.resolve(TOKENS.AuthController)
  );
}

/**
 * Creates a HealthController instance by resolving its dependencies from the given IoC container.
 *
 * The following tokens must be registered in the container:
 * - TOKENS.Config
 * - TOKENS.Logger
 * - TOKENS.Uuid
 * - TOKENS.Clock
 *
 * @param c - The inversion-of-control container used to resolve dependencies.
 * @returns A fully initialized HealthController.
 * @throws Error If any required dependency cannot be resolved from the container.
 * @remarks Ensure all required tokens are bound in the container before invoking this factory.
 */

export function createHealthController(c: IContainer): services.HealthController {
  return new services.HealthController(
    c,
    c.resolve(TOKENS.Config),
    c.resolve(TOKENS.Logger),
    c.resolve(TOKENS.Uuid),
    c.resolve(TOKENS.Clock)
  );
}

/**
 * Creates an instance of the PkceValidatorService.
 *
 * @param c - The container used to resolve dependencies.
 * @returns An instance of PkceValidatorService.
 */

export function createPkceValidator(c: IContainer): services.PkceValidatorService {
  return new services.PkceValidatorService(c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the AuthorizationCodeRepositoryImpl.
 *
 * @param c - The dependency injection container used to resolve dependencies.
 * @returns An instance of AuthorizationCodeRepositoryImpl.
 */

export function createAuthorizationCodeRepository(c: IContainer): services.AuthorizationCodeRepositoryImpl {
  return new services.AuthorizationCodeRepositoryImpl(c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the GenerateAuthorizationCodeUseCase.
 *
 * @param c - The container used to resolve dependencies.
 * @returns An instance of GenerateAuthorizationCodeUseCase.
 */

export function createGenerateAuthorizationCodeUseCase(c: IContainer): usesCases.GenerateAuthorizationCodeUseCase {
  return new usesCases.GenerateAuthorizationCodeUseCase(
    c.resolve(TOKENS.AuthorizationCodeRepository),
    c.resolve(TOKENS.Uuid),
    c.resolve(TOKENS.Logger)
  );
}

/**
 * Creates an instance of the ExchangeAuthorizationCodeUseCase.
 *
 * @param c - The container used to resolve dependencies.
 * @returns An instance of ExchangeAuthorizationCodeUseCase.
 */

export function createExchangeAuthorizationCodeUseCase(c: IContainer): usesCases.ExchangeAuthorizationCodeUseCase {
  return new usesCases.ExchangeAuthorizationCodeUseCase(c.resolve(TOKENS.AuthorizationCodeRepository), c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the ValidatePkceChallengeUseCase.
 *
 * @param c - The container instance used to resolve dependencies.
 * @returns An instance of ValidatePkceChallengeUseCase.
 */

export function createValidatePkceChallengeUseCase(c: IContainer): usesCases.ValidatorPkceChallengeUseCase {
  return new usesCases.ValidatorPkceChallengeUseCase(c.resolve(TOKENS.PckValidator), c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the AuthController.
 *
 * @param c - The dependency injection container used to resolve dependencies.
 * @returns An instance of AuthController with the required dependencies injected.
 */

export function createAuthController(c: IContainer): services.AuthController {
  return new services.AuthController(
    c.resolve(TOKENS.Logger),
    c.resolve(TOKENS.GenerateAuthorizationCodeUseCase),
    c.resolve(TOKENS.ExchangeAuthorizationUseCase),
    c.resolve(TOKENS.ValidatePkceChallengeUseCase)
  );
}

/**
 * Creates a new instance of GracefulShutdown.
 *
 * @param c - The container instance used to resolve dependencies.
 * @returns A new instance of GracefulShutdown initialized with the logger from the container.
 */

export function createGracefulShutdown(c: IContainer): services.GracefulShutdown {
  return new services.GracefulShutdown(c.resolve(TOKENS.Logger));
}

/**
 * Creates and configures a JwtService using dependencies resolved from the provided inversion-of-control container.
 *
 * The container must supply bindings for TOKENS.Config, TOKENS.Logger, and TOKENS.Clock.
 *
 * @param c - The IoC container used to resolve JwtService dependencies.
 * @returns A JwtService instance initialized with configuration, logging, and clock services.
 * @throws If any required dependency (Config, Logger, or Clock) cannot be resolved from the container.
 *
 * @example
 * const jwt = createJwtService(container);
 * const token = await jwt.sign({ sub: user.id });
 */

export function createJwtService(c: IContainer): JwtService {
  return new JwtService(c.resolve(TOKENS.Config), c.resolve(TOKENS.Logger), c.resolve(TOKENS.Clock));
}
