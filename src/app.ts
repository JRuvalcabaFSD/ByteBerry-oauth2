/* eslint-disable no-console */
import { buildContainer, TOKENS } from '@/container';
import { healthController } from '@/presentation';

(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  main().catch((err: any) => {
    console.log('Fatal error during startup', err.message);
    process.exit(1);
  });
})();

async function main() {
  const container = buildContainer();
  const health = container.resolve<healthController>(TOKENS.HealthController);
  console.log(JSON.stringify(health.status()));

  process.exit(0);
}
