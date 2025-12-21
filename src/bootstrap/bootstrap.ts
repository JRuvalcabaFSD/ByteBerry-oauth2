import { bootstrapContainer } from '@container';
import { AppError } from '@domain';
import { IContainer } from '@interfaces';
import { BootstrapError, getErrMsg } from '@shared';

interface bootstrapResult {
	container: IContainer;
	// shutdown: GracefulShutdown;
}

export async function bootstrap(): Promise<bootstrapResult> {
	try {
		const container = bootstrapContainer();
		const httpServer = container.resolve('HttpServer');

		await httpServer.start();

		return { container };
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new BootstrapError(`Service bootstrap failed: ${getErrMsg(error)}`, { timestamp: new Date().toISOString() });
	}
}
