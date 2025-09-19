import { EnvConfig } from '@/config';

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
  const config = new EnvConfig();
  console.log(`🚀 Starting OAuth2 Service on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔍 Log Level: ${config.logLevel}`);
}
