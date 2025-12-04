import { BootstrapError, getErrMsg, withLoggerContext } from '@shared';
import { configureShutdown, GracefulShutdown } from '@infrastructure';
import { IContainer, ILogger } from '@interfaces';
import { bootstrapContainer } from '@container';

/**
 * Represents the result of the application bootstrap process.
 *
 * @interface bootstrapResult
 * @property {IContainer} container - The dependency injection container instance that holds all registered services and dependencies.
 * @property {GracefulShutdown} shutdown - The graceful shutdown handler for properly terminating the application and cleaning up resources.
 */

export interface bootstrapResult {
	container: IContainer;
	shutdown: GracefulShutdown;
}

//TODO documentar
export async function bootstrap(): Promise<bootstrapResult> {
	let logger: ILogger | undefined;

	try {
		const container = bootstrapContainer();
		logger = withLoggerContext(container.resolve('Logger'), 'bootstrap');

		logger.info('Service starting');

		const shutdown = configureShutdown(container);

		return { container, shutdown };
	} catch (error) {
		const errorMessage = getErrMsg(error);
		throw new BootstrapError(`Service bootstrap failed: ${getErrMsg(errorMessage)}`, { timeStamp: new Date().toISOString() });
	}
}
