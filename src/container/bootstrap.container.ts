import * as Factories from '@container';
import { Container, Token, criticalServices } from '@container';
import { ContainerCreationError } from '@shared';
import { IContainer } from '@interfaces';
import { AppError } from '@domain';

//TODO documentar
export function bootstrapContainer(): IContainer {
	const container = new Container();

	registerCoreServices(container);
	registerRepositories(container);
	registerUseCases(container);
	registerControllers(container);
	OAuthServices(container);
	registerDatabaseServices(container);

	validate(container, criticalServices);

	return container;
}

function registerCoreServices(c: IContainer): void {
	c.registerSingleton('Config', Factories.createConfig);
	c.registerSingleton('Clock', Factories.createClockService);
	c.registerSingleton('UUid', Factories.createUuidService);
	c.registerSingleton('Logger', Factories.createLoggerService);
	c.registerSingleton('HttpServer', Factories.createHttpServer);
	c.registerSingleton('HealthService', Factories.createHealthService);
	c.registerSingleton('GracefulShutdown', Factories.createGracefulShutdown);
}

function registerRepositories(c: IContainer): void {
	c.registerSingleton('UserRepository', Factories.createUserRepository);
	c.registerSingleton('SessionRepository', Factories.createSessionRepository);
	c.registerSingleton('AuthCodeRepository', Factories.createAuthCodeRepository);
	c.registerSingleton('OAuthClientRepository', Factories.createOAuthClientRepository);
}

function registerUseCases(c: IContainer): void {
	c.registerSingleton('LoginUserCase', Factories.createLoginUseCase);
	c.registerSingleton('GenerateAuthCodeUseCase', Factories.createGenerateAuthCodeUseCase);
	c.registerSingleton('ValidateClientUseCase', Factories.createValidateClientUseCase);
	c.registerSingleton('PKCEVerifierUseCase', Factories.createPKCEVerifierUseCase);
	c.registerSingleton('ExchangeTokenUseCase', Factories.createExchangeTokenUseCase);
	c.registerSingleton('GetJWksUseCase', Factories.createGetJwksUseCase);
}

function registerControllers(c: IContainer): void {
	c.registerSingleton('LoginController', Factories.createLoginController);
	c.registerSingleton('AuthCodeController', Factories.createAuthCodeController);
	c.registerSingleton('TokenController', Factories.createTokenController);
	c.registerSingleton('JwksController', Factories.createJwksController);
}

function OAuthServices(c: IContainer): void {
	c.registerSingleton('HashService', Factories.createHashService);
	c.registerSingleton('KeyLoaderService', Factories.createKeyLoaderService);
	c.registerSingleton('JwtService', Factories.createJwtService);
	c.registerSingleton('JwksService', Factories.createJwksService);
}

function registerDatabaseServices(c: IContainer): void {
	c.registerSingleton('DBConfig', Factories.createDBConfig);
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
