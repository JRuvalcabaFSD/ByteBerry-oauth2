import { createClockService, createUuidService } from '@/infrastructure';
import { criticalServices, TOKENS } from '@/container/tokens';
import { createWinstonLoggerService } from '@/container';
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
  container.register(TOKENS.Clock, createClockService);
  container.register(TOKENS.Uuid, createUuidService);
  container.register(TOKENS.Logger, createWinstonLoggerService);
  //TODO HealthController
  //TODO HttpServer

  criticalServices.forEach(({ token }) => {
    if (!container.isRegistered(token)) throw new ContainerCreationError(token);
  });

  return container;
}
