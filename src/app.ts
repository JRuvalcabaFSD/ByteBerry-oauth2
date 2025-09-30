import { createConfig } from '@/config';

/* eslint-disable no-console */
(async () => {
  await main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
})();

async function main(): Promise<void> {
  const config = createConfig();

  console.log('Service init', { ...config });
}
