import { TOKENS } from '@/container/tokens';
import { Container } from './container';
import { IClock, IContainer, IEnvConfig, ILogger, IUuid } from '@/interfaces';
import { EnvConfig } from '@/config';
import { ClockService, HttpServer, LoggerService, UuidService } from '@/infrastructure';
import { DependencyCreationError } from '@/shared';

export function bootstrapContainer(): IContainer {
  const container = new Container();

  try {
    container.registerSingleton(TOKENS.Config, () => new EnvConfig());
    container.registerSingleton(TOKENS.Clock, () => new ClockService());
    container.registerSingleton(TOKENS.Uuid, () => new UuidService());
    container.registerSingleton(
      TOKENS.Logger,
      c => new LoggerService(c.resolve<IEnvConfig>(TOKENS.Config), c.resolve<IClock>(TOKENS.Clock))
    );
    container.registerSingleton(
      TOKENS.HttpServer,
      c => new HttpServer(c.resolve<IEnvConfig>(TOKENS.Config), c.resolve<IUuid>(TOKENS.Uuid), c.resolve<ILogger>(TOKENS.Logger))
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
