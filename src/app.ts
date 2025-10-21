/* eslint-disable no-console */
import { bootstrap } from '@/bootstrap';
import { getErrorMessage, withLoggerContext } from '@/shared';

(() => {
  main().catch(error => {
    console.error('Application failed to start:', getErrorMessage(error));
    process.exit(1);
  });
})();

async function main(): Promise<void> {
  const { container } = await bootstrap();

  const ctxLogger = withLoggerContext(container.resolve('Logger'), 'main');

  ctxLogger.info('Service initialized successfully');
}
