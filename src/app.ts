import { bootstrapContainer } from '@/container/bootstrap.container';
import { getErrMsg } from '@/shared';

(() => {
  main().catch(error => {
    // eslint-disable-next-line no-console
    console.error('Application failed to start: ', getErrMsg(error));
    process.exit(1);
  });
})();

async function main() {
  const container = bootstrapContainer();

  const config = container.resolve('Config');
  const clock = container.resolve('Clock');
  const uuid = container.resolve('Uuid');

  console.log({ config, timestamp: clock.timestamp(), uuid: uuid.generate() });
}
