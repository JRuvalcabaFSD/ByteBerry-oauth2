import { bootstrapContainer, TOKENS } from '@/container';
import { IClock, IEnvConfig, IHttpServer, ILogger, IUuid } from '@/interfaces';

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
  let logger: ILogger | null = null;
  try {
    const container = bootstrapContainer();

    const config = container.resolve<IEnvConfig>(TOKENS.Config);
    const clock = container.resolve<IClock>(TOKENS.Clock);
    const uuid = container.resolve<IUuid>(TOKENS.Uuid);
    logger = container.resolve<ILogger>(TOKENS.Logger);
    httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);

    logger.info('Starting OAuth2 Service', {
      port: config.port,
      environment: config.nodeEnv,
      logLevel: config.logLevel,
      dependencies: container.getRegisteredTokens().length,
      sampleUuid: uuid.generate(),
      startTime: clock.now().toISOString(),
    });

    await httpServer.start();
    logger.info('OAuth2 Service bootstrap completed successfully');
  } catch (error) {
    if (logger) {
      logger.error('Bootstrap failed', error as Error);
    } else {
      console.error('❌ Bootstrap failed:', error);
    }

    if (httpServer) {
      try {
        await httpServer.stop();
      } catch (shutdownError) {
        if (logger) {
          logger.error('Failed to stop HTTP server during cleanup', shutdownError as Error);
        } else {
          console.error('❌ Failed to stop HTTP server:', shutdownError);
        }
      }
    }

    process.exit(1);
  }

  // Graceful shutdown handlers
  const gracefulShutdown = async (signal: string) => {
    if (logger) {
      logger.info('Graceful shutdown initiated', { signal });
    } else {
      console.log(`🛑 ${signal} received, shutting down gracefully`);
    }

    if (httpServer) {
      try {
        await httpServer.stop();
        if (logger) {
          logger.info('Graceful shutdown completed successfully');
        } else {
          console.log('✅ Graceful shutdown completed');
        }
      } catch (error) {
        if (logger) {
          logger.error('Error during graceful shutdown', error as Error);
        } else {
          console.error('❌ Error during shutdown:', error);
        }
      }
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
