import { TOKENS } from '@/container/tokens';
import { Container } from './container';
import { IContainer } from '@/interfaces';
import { EnvConfig } from '@/config';
import { ClockService, UuidService } from '@/infrastructure';
import { DependencyCreationError } from '@/shared';

export function bootstrapContainer(): IContainer {
  const container = new Container();

  try {
    container.registerSingleton(TOKENS.Config, () => new EnvConfig());
    container.registerSingleton(TOKENS.Clock, () => new ClockService());
    container.registerSingleton(TOKENS.Uuid, () => new UuidService());
    //TODO register Logger
    //TODO register httpServer
    //TODO register HealthController

    return container;
  } catch (error) {
    if (error instanceof Error) {
      throw new DependencyCreationError(Symbol.for('Bootstrap'), error);
    }
    throw error;
  }
}
