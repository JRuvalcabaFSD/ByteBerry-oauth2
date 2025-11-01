import { createConfig } from '@/config';
import { Container, criticalServices, Token } from '@/container';
import { IContainer } from '@/interfaces';
import { ContainerCreationError } from '@/shared';

export function bootstrapContainer(): IContainer {
  const container = new Container();

  container.registerSingleton('Config', createConfig);

  validate(container, criticalServices);

  return container;
}

export function validate(container: IContainer, services: string[]): void {
  services.forEach(token => {
    if (!container.isRegistered(token as Token)) throw new ContainerCreationError(token as Token);
  });
}
