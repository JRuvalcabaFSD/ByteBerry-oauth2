import { TOKENS } from '@/container/tokens';
import { Container } from './container';
import { IContainer, IEnvConfig, IUuid } from '@/interfaces';
import { EnvConfig } from '@/config';
import { ClockService, HttpServer, UuidService } from '@/infrastructure';
import { DependencyCreationError } from '@/shared';

export function bootstrapContainer(): IContainer {
  const container = new Container();

  try {
    container.registerSingleton(TOKENS.Config, () => new EnvConfig());
    container.registerSingleton(TOKENS.Clock, () => new ClockService());
    container.registerSingleton(TOKENS.Uuid, () => new UuidService());
    //TODO register Logger
    container.registerSingleton(
      TOKENS.HttpServer,
      c => new HttpServer(c.resolve<IEnvConfig>(TOKENS.Config), c.resolve<IUuid>(TOKENS.Uuid))
    );
    //TODO register HealthController

    return container;
  } catch (error) {
    if (error instanceof Error) {
      throw new DependencyCreationError(Symbol.for('Bootstrap'), error);
    }
    throw error;
  }
}
