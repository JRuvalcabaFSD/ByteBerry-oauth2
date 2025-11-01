import { bootstrapContainer } from '@/container/bootstrap.container';
import { getErrMsg, withLoggerContext } from '@/shared';

(() => {
  main().catch(error => {
    // eslint-disable-next-line no-console
    console.error('Application failed to start: ', getErrMsg(error));
    process.exit(1);
  });
})();

async function main() {
  const container = bootstrapContainer();

  const ctxLogger = withLoggerContext(container.resolve('Logger'), 'main');

  ctxLogger.info('Service initialized successfully');
}
