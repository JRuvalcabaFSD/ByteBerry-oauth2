/* eslint-disable no-console */
import { bootstrapContainer } from '@/container';
import { createLoggerContextContainer, getErrorMessage } from '@/shared';

(() => {
  main().catch(error => {
    console.error('Application failed to start:', getErrorMessage(error));
    process.exit(1);
  });
})();

async function main(): Promise<void> {
  const container = bootstrapContainer();

  const containerContext = createLoggerContextContainer(container, 'Main');

  const config = container.resolve('Config');
  const logger = containerContext.resolve('Logger');

  logger.info(`${config.serviceName} [ver: ${config.version}] Service initialized successfully`);
}
