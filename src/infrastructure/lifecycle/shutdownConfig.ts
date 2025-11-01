import { GracefulShutdown } from '@/infrastructure';
import { IContainer } from '@/interfaces';
import { getErrMsg, wrapContainerLogger } from '@/shared';

export function configureShutdown(container: IContainer): GracefulShutdown {
  const containerContext = wrapContainerLogger(container, 'configureShutdown');

  const gracefulShutdown = containerContext.resolve('GracefulShutdown');
  const logger = containerContext.resolve('Logger');

  logger.debug('Configuring graceful shutdown');

  //Register Http Service in cleanup function
  gracefulShutdown.registerCleanup(async () => {
    logger.debug('Closing Http Server');

    try {
      const httpServer = container.resolve('HttpServer');

      if (httpServer && typeof httpServer.stop === 'function') {
        await httpServer.stop();

        logger.info('Http Server closed');
      }
    } catch (error) {
      logger.error('Failed to stop Http Server', { error: getErrMsg(error) });
      throw error;
    }
  });

  //TODO registrar Database service
  //TODO registrar Redis service
  logger.debug('Graceful shutdown configured', { requestCleanups: gracefulShutdown.registerCleanupsCount });

  return gracefulShutdown;
}
