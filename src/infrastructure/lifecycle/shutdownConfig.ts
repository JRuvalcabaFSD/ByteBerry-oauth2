import { AuthorizationCodeRepositoryImpl, GracefulShutdown } from '@/infrastructure';
import { IContainer, IHttpServer, ILogger } from '@/interfaces';
import { TOKENS } from '@/container';

export function configureShutdown(container: IContainer): GracefulShutdown {
  const gracefulShutdown = container.resolve<GracefulShutdown>(TOKENS.GracefulShutdown);
  const logger = container.resolve<ILogger>(TOKENS.Logger);
  const mainContext = 'configureShutdown';

  logger.debug('Configuring graceful shutdown', { context: mainContext });

  // ==========================================
  // F1 CLEANUP: Stop AuthorizationCodeRepository tasks
  // ==========================================
  gracefulShutdown.registerCleanup(async () => {
    const context = mainContext + '.authCodeRepo';

    logger.debug('Stopping AuthorizationCodeRepository cleanup tasks', { context });
    try {
      const authCodeRepo = container.resolve<AuthorizationCodeRepositoryImpl>(TOKENS.AuthorizationCodeRepository);

      if (authCodeRepo && typeof authCodeRepo.stopCleanupTask === 'function') {
        authCodeRepo.stopCleanupTask();
      }

      logger.info('AuthorizationCodeRepository cleanup tasks stopped', { context });
    } catch (error) {
      logger.error('Failed to stop AuthorizationCodeRepository tasks', {
        context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  });

  // ==========================================
  // F1 CLEANUP: Close HTTP Server
  // ==========================================
  gracefulShutdown.registerCleanup(async () => {
    const context = mainContext + '.HttpServer';

    logger.debug('Closing HTTP server', { context });

    try {
      const httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);

      if (httpServer && typeof httpServer.stop === 'function') {
        await httpServer.stop();

        logger.info('HTTP server closed', { context });
      }
    } catch (error) {
      logger.error('Failed to stop Http Server', {
        context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  });

  // ==========================================
  // TODO F2+ CLEANUP: Close Database connections
  // ==========================================

  const registeredCleanupsCount = 2;

  logger.info('Graceful shutdown configured', {
    context: mainContext,
    registeredCleanups: registeredCleanupsCount,
  });

  // ==========================================
  // TODO F6+ CLEANUP: Close Redis connections
  // ==========================================

  return gracefulShutdown;
}
