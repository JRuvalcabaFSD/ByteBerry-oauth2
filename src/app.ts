import { bootstrapContainer, TOKENS } from '@/container';
import { IClock, IConfig, IUuid } from '@/interfaces';

/* eslint-disable no-console */
(async () => {
  await main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
})();

async function main(): Promise<void> {
  const container = bootstrapContainer();

  const config = container.resolve<IConfig>(TOKENS.Config);
  const clock = container.resolve<IClock>(TOKENS.Clock);
  const uuid = container.resolve<IUuid>(TOKENS.Uuid);

  console.log('Service running', {
    config,
    timestamp: clock.timestamp(),
    uuidExample: uuid.generate(),
  });
}
