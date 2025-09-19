import { bootstrapContainer, TOKENS } from '@/container';
import { IClock, IEnvConfig, IUuid } from '@/interfaces';

/* eslint-disable no-console */
(async () => {
  await main().catch(error => {
    console.error('❌ Failed to start OAuth2 Service:', error);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
})();

async function main(): Promise<void> {
  const container = bootstrapContainer();

  const config = container.resolve<IEnvConfig>(TOKENS.Config);
  const clock = container.resolve<IClock>(TOKENS.Clock);
  const uuid = container.resolve<IUuid>(TOKENS.Uuid);

  console.log(`🚀 Starting OAuth2 Service on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔍 Log Level: ${config.logLevel}`);
  console.log(`📦 DI Container initialized with ${container.getRegisteredTokens().length} dependencies`);
  console.log(`⏰ Current time: ${clock.now().toISOString()}`);
  console.log(`🆔 Sample UUID: ${uuid.generate()}`);
}
