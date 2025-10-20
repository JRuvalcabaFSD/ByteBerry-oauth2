import { createConfig } from '@/config';
import { Container, criticalServices, ServiceMap, Token } from '@/container';
import { createWinstonLoggerService } from '@/container/factories';
import { createClockService, createUuidService } from '@/infrastructure';
import { IContainer } from '@/interfaces';
import { ContainerCreationError } from '@/shared';

/**
 * Bootstraps and returns a dependency injection container pre-populated with core singletons.
 *
 * This function instantiates a new container, registers the following singleton services:
 * - 'Config' using the createConfig factory
 * - 'Clock' using the createConfig factory
 * - 'Uuid' using the createUuidService factory
 *
 * After registering these services it verifies that every token listed in the module-level
 * `criticalServices` collection is present in the container. If any required token is missing,
 * a ContainerCreationError is thrown to prevent starting with an invalid container state.
 *
 * @returns {IContainer} An initialized container with the required singletons registered.
 * @throws {ContainerCreationError} If any token in `criticalServices` is not registered.
 */

export function bootstrapContainer(): IContainer<ServiceMap> {
  const container = new Container<ServiceMap>();

  container.registerSingleton('Config', createConfig);
  container.registerSingleton('Clock', createClockService);
  container.registerSingleton('Uuid', createUuidService);
  container.registerSingleton('Logger', createWinstonLoggerService);

  criticalServices.forEach(token => {
    if (!container.isRegistered(token as Token)) throw new ContainerCreationError(token as Token);
  });

  return container;
}
