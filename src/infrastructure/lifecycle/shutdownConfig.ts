import { IContainer } from '@interfaces';
import { GracefulShutdown } from './shutdown.js';
import { wrapContainerLogger } from '@shared';

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

	return GShutdown;
}
