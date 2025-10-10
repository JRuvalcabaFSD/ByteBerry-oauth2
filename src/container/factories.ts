import {
  ExchangeAuthorizationCodeUseCase,
  GenerateAuthorizationCodeUseCase,
  ValidatorPkceChallengeUseCase as ValidatePkceChallengeUseCase,
} from '@/application';
import { TOKENS } from '@/container';
import {
  AuthorizationCodeRepositoryImpl,
  HealthController,
  HttpServer,
  PkceValidatorService,
  WinstonLoggerService,
} from '@/infrastructure';
import { AuthController } from '@/infrastructure/controller/auth.controller';
import { IContainer } from '@/interfaces';

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

export function createWinstonLoggerService(c: IContainer): WinstonLoggerService {
  return new WinstonLoggerService(c.resolve(TOKENS.Config), c.resolve(TOKENS.Clock));
}

/**
 * Creates and returns a new instance of the `HttpServer` class, resolving all required dependencies
 * from the provided container.
 *
 * @param c - The dependency injection container used to resolve required services and controllers.
 * @returns A fully constructed `HttpServer` instance with all dependencies injected.
 */

export function createHttpServer(c: IContainer): HttpServer {
  return new HttpServer(
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

export function createHealthController(c: IContainer): HealthController {
  return new HealthController(c, c.resolve(TOKENS.Config), c.resolve(TOKENS.Logger), c.resolve(TOKENS.Uuid), c.resolve(TOKENS.Clock));
}

/**
 * Creates an instance of the PkceValidatorService.
 *
 * @param c - The container used to resolve dependencies.
 * @returns An instance of PkceValidatorService.
 */

export function createPkceValidator(c: IContainer): PkceValidatorService {
  return new PkceValidatorService(c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the AuthorizationCodeRepositoryImpl.
 *
 * @param c - The dependency injection container used to resolve dependencies.
 * @returns An instance of AuthorizationCodeRepositoryImpl.
 */

export function createAuthorizationCodeRepository(c: IContainer): AuthorizationCodeRepositoryImpl {
  return new AuthorizationCodeRepositoryImpl(c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the GenerateAuthorizationCodeUseCase.
 *
 * @param c - The container used to resolve dependencies.
 * @returns An instance of GenerateAuthorizationCodeUseCase.
 */

export function createGenerateAuthorizationCodeUseCase(c: IContainer): GenerateAuthorizationCodeUseCase {
  return new GenerateAuthorizationCodeUseCase(
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

export function createExchangeAuthorizationCodeUseCase(c: IContainer): ExchangeAuthorizationCodeUseCase {
  return new ExchangeAuthorizationCodeUseCase(c.resolve(TOKENS.AuthorizationCodeRepository), c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the ValidatePkceChallengeUseCase.
 *
 * @param c - The container instance used to resolve dependencies.
 * @returns An instance of ValidatePkceChallengeUseCase.
 */

export function createValidatePkceChallengeUseCase(c: IContainer): ValidatePkceChallengeUseCase {
  return new ValidatePkceChallengeUseCase(c.resolve(TOKENS.PckValidator), c.resolve(TOKENS.Logger));
}

/**
 * Creates an instance of the AuthController.
 *
 * @param c - The dependency injection container used to resolve dependencies.
 * @returns An instance of AuthController with the required dependencies injected.
 */

export function createAuthController(c: IContainer): AuthController {
  return new AuthController(
    c.resolve(TOKENS.Logger),
    c.resolve(TOKENS.GenerateAuthorizationCodeUseCase),
    c.resolve(TOKENS.ExchangeAuthorizationUseCase),
    c.resolve(TOKENS.ValidatePkceChallengeUseCase)
  );
}
