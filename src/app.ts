/* eslint-disable no-console */
import { loadConfig } from '@/config';

(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  main().catch((err: any) => {
    console.log('Fatal error during startup', err.message);
    process.exit(1);
  });
})();

async function main() {
  const cfg = loadConfig();
  console.log({
    msg: 'Config loaded',
    nodeEnv: cfg.nodeEnv,
    port: cfg.port,
    logLevel: cfg.logLevel,
  });
  process.exit(0);
}
