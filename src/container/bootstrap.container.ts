import * as factories from '@container';

import { createClockService, createUuidService } from '@/infrastructure';
import { ContainerCreationError } from '@/shared';
import { IContainer } from '@/interfaces';
import { createConfig } from '@/config';

const { TOKENS } = factories;

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
  const container = new factories.Container();

  // ==========================================
  // CORE SERVICES
  // ==========================================
  container.registerSingleton(TOKENS.Config, createConfig);
  container.registerSingleton(TOKENS.Logger, factories.createWinstonLoggerService);
  container.registerSingleton(TOKENS.Clock, createClockService);
  container.registerSingleton(TOKENS.Uuid, createUuidService);

  // ==========================================
  // OAUTH2 SERVICES
  // ==========================================
  container.registerSingleton(TOKENS.PckValidator, factories.createPkceValidator);
  container.registerSingleton(TOKENS.AuthorizationCodeRepository, factories.createAuthorizationCodeRepository);
  container.register(TOKENS.JwtService, factories.createJwtService);

  // ==========================================
  // USE CASES
  // ==========================================
  container.register(TOKENS.GenerateAuthorizationCodeUseCase, factories.createGenerateAuthorizationCodeUseCase);
  container.register(TOKENS.ValidatePkceChallengeUseCase, factories.createValidatePkceChallengeUseCase);
  container.register(TOKENS.ExchangeAuthorizationUseCase, factories.createExchangeAuthorizationCodeUseCase);

  // ==========================================
  // CONTROLLERS
  // ==========================================
  container.register(TOKENS.HealthController, factories.createHealthController);
  container.register(TOKENS.AuthController, factories.createAuthController);

  // ==========================================
  // INFRASTRUCTURE
  // ==========================================
  container.registerSingleton(TOKENS.HttpServer, factories.createHttpServer);
  container.registerSingleton(TOKENS.GracefulShutdown, factories.createGracefulShutdown);

  factories.criticalServices.forEach(({ token }) => {
    if (!container.isRegistered(token)) throw new ContainerCreationError(token);
  });

  return container;
}
