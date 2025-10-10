import { createClockService, createUuidService } from '@/infrastructure';
import {
  createAuthController,
  createAuthorizationCodeRepository,
  createGenerateAuthorizationCodeUseCase,
  createHealthController,
  createHttpServer,
  createPkceValidator,
  createValidatePkceChallengeUseCase,
  createWinstonLoggerService,
  criticalServices,
  TOKENS,
} from '@/container';
import { Container } from '@/container/container';
import { ContainerCreationError } from '@/shared';
import { IContainer } from '@/interfaces';
import { createConfig } from '@/config';

/**
 * Creates and configures a dependency injection container with all required services.
 *
 * Registers core services including configuration, clock, and UUID services.
 * Validates that all critical services are properly registered before returning
 * the container instance.
 *
 * @returns {IContainer} A fully configured container with all dependencies registered
 * @throws {ContainerCreationError} When a critical service token is not registered
 *
 * @example
 * ```typescript
 * const container = bootstrapContainer();
 * const config = container.resolve(TOKENS.Config);
 * ```
 */

export function bootstrapContainer(): IContainer {
  const container = new Container();

  container.register(TOKENS.Config, createConfig);
  container.register(TOKENS.Logger, createWinstonLoggerService);
  container.register(TOKENS.Clock, createClockService);
  container.register(TOKENS.Uuid, createUuidService);
  container.register(TOKENS.PckValidator, createPkceValidator);
  container.register(TOKENS.AuthorizationCodeRepository, createAuthorizationCodeRepository);
  container.register(TOKENS.GenerateAuthorizationCodeUseCase, createGenerateAuthorizationCodeUseCase);
  container.register(TOKENS.ValidatePkceChallengeUseCase, createValidatePkceChallengeUseCase);

  container.register(TOKENS.HealthController, createHealthController);
  container.register(TOKENS.AuthController, createAuthController);
  container.register(TOKENS.HttpServer, createHttpServer);

  criticalServices.forEach(({ token }) => {
    if (!container.isRegistered(token)) throw new ContainerCreationError(token);
  });

  return container;
}
