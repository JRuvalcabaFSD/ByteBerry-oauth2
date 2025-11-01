import { createConfig } from '@/config';
import {
  Container,
  createGracefulShutdown,
  createHealthController,
  createHttpServer,
  createWinstonLoggerService,
  criticalServices,
  Token,
} from '@/container';
import { createClockService, createUuidService } from '@/infrastructure';
import { IContainer } from '@/interfaces';
import { ContainerCreationError } from '@/shared';

export function bootstrapContainer(): IContainer {
  const container = new Container();

  container.registerSingleton('Config', createConfig);
  container.registerSingleton('Clock', createClockService);
  container.registerSingleton('Uuid', createUuidService);
  container.registerSingleton('Logger', createWinstonLoggerService);
  container.registerSingleton('GracefulShutdown', createGracefulShutdown);
  container.registerSingleton('HttpServer', createHttpServer);
  container.registerSingleton('HealthController', createHealthController);

  validate(container, criticalServices);

  return container;
}

export function validate(container: IContainer, services: string[]): void {
  services.forEach(token => {
    if (!container.isRegistered(token as Token)) throw new ContainerCreationError(token as Token);
  });
}
