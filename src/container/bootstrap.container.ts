import * as factories from '@container';
import { Container, criticalServices, Token } from '@container';
import { IContainer } from '@interfaces';
import { ContainerCreationError } from '@shared';

//TODO documentar
export function bootstrapContainer(): IContainer {
	const container = new Container();

	registerCoreServices(container);

	validate(container, criticalServices);

	return container;
}

//TODO documentar
function registerCoreServices(c: IContainer): void {
	c.registerSingleton('Config', factories.createConfig);
	c.registerSingleton('Clock', factories.createClockService);
	c.registerSingleton('Logger', factories.createWintonLoggerService);
	c.registerSingleton('Uuid', factories.createUuidService);
	c.registerSingleton('HttpServer', factories.createHttpServer);
	c.registerSingleton('GracefulShutdown', factories.createGracefulShutdown);
}

/**
 * Validates that all required services are registered in the container.
 *
 * @param container - The dependency injection container to validate against.
 * @param services - An array of service token identifiers to check for registration.
 * @throws {ContainerCreationError} Throws when a service token is not registered in the container.
 *
 * @remarks
 * This function iterates through each service token and verifies its registration status.
 * If any token is not registered, a ContainerCreationError is immediately thrown with the
 * unregistered token as context.
 */

function validate(container: IContainer, services: string[]): void {
	services.forEach((token) => {
		if (!container.isRegistered(token as Token)) throw new ContainerCreationError(token as Token);
	});
}
