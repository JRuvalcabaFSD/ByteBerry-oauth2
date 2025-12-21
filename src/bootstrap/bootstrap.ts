import { bootstrapContainer } from '@container';
import { AppError } from '@domain';
import { IContainer, ILogger } from '@interfaces';
import { BootstrapError, getErrMsg, withLoggerContext } from '@shared';

interface bootstrapResult {
	container: IContainer;
	// shutdown: GracefulShutdown;
}

export async function bootstrap(): Promise<bootstrapResult> {
	let logger: ILogger | undefined;

	try {
		const container = bootstrapContainer();
		logger = withLoggerContext(container.resolve('Logger'), 'bootstrap');

		logger.info('Service starting');

		const httpServer = container.resolve('HttpServer');

		await httpServer.start();

		return { container };
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new BootstrapError(`Service bootstrap failed: ${getErrMsg(error)}`, { timestamp: new Date().toISOString() });
	}
}
