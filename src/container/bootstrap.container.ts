import { createClockService, createUuidService } from '@/infrastructure';
import {
  createAuthController,
  createAuthorizationCodeRepository,
  createExchangeAuthorizationCodeUseCase,
  createGenerateAuthorizationCodeUseCase,
  createGracefulShutdown,
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

  // ==========================================
  // CORE SERVICES
  // ==========================================
  container.registerSingleton(TOKENS.Config, createConfig);
  container.registerSingleton(TOKENS.Logger, createWinstonLoggerService);
  container.registerSingleton(TOKENS.Clock, createClockService);
  container.registerSingleton(TOKENS.Uuid, createUuidService);

  // ==========================================
  // OAUTH2 SERVICES
  // ==========================================
  container.registerSingleton(TOKENS.PckValidator, createPkceValidator);
  container.registerSingleton(TOKENS.AuthorizationCodeRepository, createAuthorizationCodeRepository);

  // ==========================================
  // USE CASES
  // ==========================================
  container.register(TOKENS.GenerateAuthorizationCodeUseCase, createGenerateAuthorizationCodeUseCase);
  container.register(TOKENS.ValidatePkceChallengeUseCase, createValidatePkceChallengeUseCase);
  container.register(TOKENS.ExchangeAuthorizationUseCase, createExchangeAuthorizationCodeUseCase);

  // ==========================================
  // CONTROLLERS
  // ==========================================
  container.register(TOKENS.HealthController, createHealthController);
  container.register(TOKENS.AuthController, createAuthController);

  // ==========================================
  // INFRASTRUCTURE
  // ==========================================
  container.registerSingleton(TOKENS.HttpServer, createHttpServer);
  container.registerSingleton(TOKENS.GracefulShutdown, createGracefulShutdown);

  criticalServices.forEach(({ token }) => {
    if (!container.isRegistered(token)) throw new ContainerCreationError(token);
  });

  return container;
}
