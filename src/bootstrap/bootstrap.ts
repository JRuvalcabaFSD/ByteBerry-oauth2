import { AppError, BootstrapError, getErrMsg, withLoggerContext } from '@shared';
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
		const httpServer = container.resolve('HttpServer');

		await validateDbConnection(container, logger);

		await httpServer.start();

		return { container, shutdown };
	} catch (error) {
		const errorMessage = getErrMsg(error);
		if (error instanceof AppError) throw error;
		throw new BootstrapError(`Service bootstrap failed: ${getErrMsg(errorMessage)}`, { timeStamp: new Date().toISOString() });
	}
}

/**
 * Validates the database connection by attempting to connect using the provided container's `DbConfig`.
 * Logs an error and throws a `BootstrapError` if the connection fails.
 *
 * @param container - The dependency injection container providing the `DbConfig` instance.
 * @param logger - The logger instance used for contextual logging.
 * @throws {BootstrapError} If the database connection test fails.
 */

async function validateDbConnection(container: IContainer, logger: ILogger) {
	const ctxLogger = withLoggerContext(logger, 'bootstrap.validateDbConnection');

	try {
		await container.resolve('DbConfig').testConnect();
	} catch (error) {
		ctxLogger.error('Database connection failed', { error: getErrMsg(error) });
		throw new BootstrapError('Database connection failed', { error: getErrMsg(error) });
	}
}
