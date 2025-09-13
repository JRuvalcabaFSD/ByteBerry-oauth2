import { Clock, Logger } from '@/interfaces';
import { ConsoleLogger, NativeUuid, SystemClock } from '@/infrastructure';
import { Container, SimpleContainer, TOKENS } from '@/container';
import { healthController } from '@/presentation';
import { loadConfig } from '@/config';

export function buildContainer(): Container {
  const container = new SimpleContainer();
  const cfg = loadConfig();

  container.registerInstance(TOKENS.Config, cfg);
  container.registerSingleton(TOKENS.Logger, c => {
    const { logLevel } = c.resolve<typeof cfg>(TOKENS.Config);
    return new ConsoleLogger(logLevel, { service: 'oauth2' });
  });
  container.registerSingleton(TOKENS.Clock, () => new SystemClock());
  container.registerSingleton(TOKENS.Uuid, () => new NativeUuid());
  container.register(TOKENS.HealthController, c => {
    const clock = c.resolve<Clock>(TOKENS.Clock);
    const logger = c.resolve<Logger>(TOKENS.Logger);
    const { nodeEnv } = c.resolve<typeof cfg>(TOKENS.Config);
    const version = process.env.npm_package_version ?? '0.0.0-' + nodeEnv;
    return new healthController(clock, logger, version, 'oauth2');
  });

  return container;
}
