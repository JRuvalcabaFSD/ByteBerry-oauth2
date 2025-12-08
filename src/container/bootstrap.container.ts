import * as factories from '@container';
import { Container, criticalServices, Token } from '@container';
import { IContainer } from '@interfaces';
import { ContainerCreationError } from '@shared';

//TODO documentar
export function bootstrapContainer(): IContainer {
	const container = new Container();

	registerCoreServices(container);
	registerHttpServices(container);
	registerOAuthServices(container);

	validate(container, criticalServices);

	return container;
}

/**
 * Registers core services into the dependency injection container.
 *
 * This function registers essential singleton services required by the application,
 * including configuration, clock service, logging, UUID generation, HTTP server,
 * and graceful shutdown handler.
 *
 * @param c - The dependency injection container instance where services will be registered.
 *
 * @remarks
 * All services are registered as singletons, meaning only one instance of each
 * service will be created and shared throughout the application lifecycle.
 *
 * The following services are registered:
 * - `Config`: Application configuration service
 * - `Clock`: Clock/time service for time-related operations
 * - `Logger`: Winston-based logging service
 * - `Uuid`: UUID generation service
 * - `HttpServer`: HTTP server instance
 * - `GracefulShutdown`: Service for handling graceful application shutdown
 */

function registerCoreServices(c: IContainer): void {
	c.registerSingleton('Config', factories.createConfig);
	c.registerSingleton('Clock', factories.createClockService);
	c.registerSingleton('Logger', factories.createWintonLoggerService);
	c.registerSingleton('Uuid', factories.createUuidService);
	c.registerSingleton('HttpServer', factories.createHttpServer);
	c.registerSingleton('GracefulShutdown', factories.createGracefulShutdown);
}

//TODO documentar
function registerHttpServices(c: IContainer): void {
	c.registerSingleton('HealthService', factories.createHealthService);
}

//TODO documentar
function registerOAuthServices(c: IContainer): void {
	c.registerSingleton('GenerateAuthCodeUseCase', factories.createGenerateAuthCodeUseCase);
	c.registerSingleton('ValidateClientUseCase', factories.createValidateClientUseCase);
	c.registerSingleton('AuthCodeRepository', factories.createAuthCodeRepository);
	c.registerSingleton('OAuthClientRepository', factories.createOAuthClientRepository);
	c.registerSingleton('AuthController', factories.createAuthController);
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
