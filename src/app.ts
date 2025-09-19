import { bootstrapContainer, TOKENS } from '@/container';
import { IClock, IEnvConfig, IHttpServer, IUuid } from '@/interfaces';

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
  let httpServer: IHttpServer | null = null;
  try {
    const container = bootstrapContainer();

    const config = container.resolve<IEnvConfig>(TOKENS.Config);
    const clock = container.resolve<IClock>(TOKENS.Clock);
    const uuid = container.resolve<IUuid>(TOKENS.Uuid);
    httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);

    console.log(`🚀 Starting OAuth2 Service on port ${config.port}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
    console.log(`🔍 Log Level: ${config.logLevel}`);
    console.log(`📦 DI Container initialized with ${container.getRegisteredTokens().length} dependencies`);
    console.log(`⏰ Current time: ${clock.now().toISOString()}`);
    console.log(`🆔 Sample UUID: ${uuid.generate()}`);

    await httpServer.start();
    console.log('✅ OAuth2 Service bootstrap completed');
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);

    if (httpServer) {
      try {
        await httpServer.stop();
      } catch (shutdownError) {
        console.error('❌ Failed to stop HTTP server:', shutdownError);
      }
    }

    process.exit(1);
  }

  // Graceful shutdown handlers
  const gracefulShutdown = async (signal: string) => {
    console.log(`🛑 ${signal} received, shutting down gracefully`);

    if (httpServer) {
      try {
        await httpServer.stop();
        console.log('✅ Graceful shutdown completed');
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
      }
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
