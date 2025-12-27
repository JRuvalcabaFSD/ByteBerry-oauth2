import { IContainer } from '@interfaces';
import { GracefulShutdown } from './shutdown.js';
import { getErrMsg, wrapContainerLogger } from '@shared';

/**
 * Configures and initializes the graceful shutdown mechanism for the application.
 *
 * This function resolves the GracefulShutdown service from the dependency injection container
 * and sets up logging for the shutdown configuration process.
 *
 * @param container - The dependency injection container that provides access to application services
 * @returns The configured GracefulShutdown instance that can be used to manage application shutdown
 *
 * @example
 * ```typescript
 * const shutdown = configureShutdown(container);
 * // Use shutdown instance to handle graceful application termination
 * ```
 */

export function configureShutdown(container: IContainer): GracefulShutdown {
	const cnxContainer = wrapContainerLogger(container, 'configureShutdown');

	const GShutdown = cnxContainer.resolve('GracefulShutdown');
	const logger = cnxContainer.resolve('Logger');

	logger.debug('Configuring graceful shutdown');

	// TODO F2
	// //Register database server in cleanup function
	// GShutdown.registerCleanup(async () => {
	// 	logger.debug('Closing database connection');

	// 	try {
	// 		const DbConfig = container.resolve('DbConfig');
	// 		if (DbConfig && typeof DbConfig.disconnect === 'function') {
	// 			await DbConfig.disconnect();
	// 		}
	// 	} catch (error) {
	// 		logger.error('Failed to stop Http Server', { error: getErrMsg(error) });
	// 		throw error;
	// 	}
	// });

	//Register Http Service in cleanup function
	GShutdown.registerCleanup(async () => {
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

	// TODO Register redis server in cleanup function

	return GShutdown;
}
