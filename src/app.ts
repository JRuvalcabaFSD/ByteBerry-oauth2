/* eslint-disable no-console */
import { Config } from '@/config';
import { getErrorMessage } from '@/shared/functions/general';

(() => {
  main().catch(error => {
    console.error('Application failed to start:', getErrorMessage(error));
    process.exit(1);
  });
})();

async function main(): Promise<void> {
  const config = Config.getConfig();

  console.log({ config });
}
