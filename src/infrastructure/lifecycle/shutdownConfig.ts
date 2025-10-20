import { ServiceMap } from '@/container';
import { GracefulShutdown } from '@/infrastructure/lifecycle/shutdown';
import { IContainer } from '@/interfaces';
import { wrapContainerLogger } from '@/shared';

export function configureShutdown(container: IContainer<ServiceMap>): GracefulShutdown {
  const containerContext = wrapContainerLogger(container, 'configureShutdown');

  const gracefulShutdown = containerContext.resolve('GracefulShutdown');
  const logger = containerContext.resolve('Logger');

  logger.debug('Configuring graceful shutdown');

  //TODO registrar servicios a limpiar
  logger.debug('Graceful shutdown configured', { requestCleanups: gracefulShutdown.registerCleanupsCount });

  return gracefulShutdown;
}
