/* eslint-disable no-console */
import { bootstrapContainer } from '@/container';
import { getErrorMessage } from '@/shared';

(() => {
  main().catch(error => {
    console.error('Application failed to start:', getErrorMessage(error));
    process.exit(1);
  });
})();

async function main(): Promise<void> {
  const container = bootstrapContainer();

  const config = container.resolve('Config');
  const logger = container.resolve('Logger');

  logger.info('Service starting', { config });
}
