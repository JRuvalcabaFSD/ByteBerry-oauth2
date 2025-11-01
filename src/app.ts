import { createConfig } from '@/config';
import { getErrMsg } from '@/shared';

(() => {
  main().catch(error => {
    // eslint-disable-next-line no-console
    console.error('Application failed to start: ', getErrMsg(error));
    process.exit(1);
  });
})();

async function main() {
  const config = createConfig();

  console.log({ config });
}
