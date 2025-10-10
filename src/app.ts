import { bootstrap } from '@/bootstrap';
import { TOKENS } from '@/container';
import { IConfig, ILogger } from '@/interfaces';

/* eslint-disable no-console */
(async () => {
  await main().catch(error => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Application failed to start:', errorMessage);
    process.exit(1);
  });
})();

async function main(): Promise<void> {
  const { container } = await bootstrap();

  const config = container.resolve<IConfig>(TOKENS.Config);
  const logger = container.resolve<ILogger>(TOKENS.Logger);

  logger.info(`${config.serviceName} [ver: ${config.version}] Service initialized successfully`);
}
