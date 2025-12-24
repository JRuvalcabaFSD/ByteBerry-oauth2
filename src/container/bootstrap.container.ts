import * as Factories from '@container';
import { Container, Token, criticalServices } from '@container';
import { ContainerCreationError } from '@shared';
import { IContainer } from '@interfaces';
import { AppError } from '@domain';

//TODO documentar
export function bootstrapContainer(): IContainer {
	const container = new Container();

	registerCoreServices(container);
	registerUserServices(container);
	registerUseCases(container);
	registerControllers(container);

	validate(container, criticalServices);

	return container;
}

/**
 * Registers the core singleton services into the provided dependency injection container.
 *
 * @param c - The dependency injection container where core services will be registered.
 *
 * The following services are registered as singletons:
 * - 'Config': Application configuration service.
 * - 'Clock': Time and date utility service.
 * - 'UUid': UUID generation service.
 * - 'Logger': Logging service.
 * - 'HttpServer': HTTP server instance.
 * - 'HealthService': Application health check service.
 */
function registerCoreServices(c: IContainer): void {
	c.registerSingleton('Config', Factories.createConfig);
	c.registerSingleton('Clock', Factories.createClockService);
	c.registerSingleton('UUid', Factories.createUuidService);
	c.registerSingleton('Logger', Factories.createLoggerService);
	c.registerSingleton('HttpServer', Factories.createHttpServer);
	c.registerSingleton('HealthService', Factories.createHealthService);
}

function registerUserServices(c: IContainer): void {
	c.registerSingleton('UserRepository', Factories.createUserRepository);
	c.registerSingleton('SessionRepository', Factories.createSessionRepository);
	c.registerSingleton('AuthCodeRepository', Factories.createAuthCodeRepository);
}

function registerUseCases(c: IContainer): void {
	c.registerSingleton('LoginUserCase', Factories.createLoginUseCase);
}

function registerControllers(c: IContainer): void {
	c.registerSingleton('LoginController', Factories.createLoginController);
}

/**
 * Validates that all provided service tokens are registered and can be resolved in the given container.
 *
 * @template T - A type that extends Token.
 * @param c - The container instance implementing the IContainer interface.
 * @param services - An array of service tokens to validate.
 * @throws {ContainerCreationError} If any token is not registered or cannot be resolved.
 */

function validate<T extends Token>(c: IContainer, services: T[]): void {
	services.forEach((token) => {
		if (!c.isRegistered(token)) throw new ContainerCreationError(token);

		try {
			c.resolve(token);
		} catch (error) {
			if (error instanceof AppError) throw error;
			throw new ContainerCreationError(token);
		}
	});
}

// Exporta solo para testing (no afecta la API pública en producción)
if (process.env.NODE_ENV === 'test') {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(module.exports as any).validate = validate;
}
