import { main } from '@/main';

(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  main().catch((err: any) => {
    // eslint-disable-next-line no-console
    console.error('[FATAL] Bootstrap failed', err);
    process.exit(1);
  });
})();
