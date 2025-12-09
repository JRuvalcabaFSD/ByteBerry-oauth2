import { GetJwksUseCase } from '@application';
import { GracefulShutdown, JwksService } from '@infrastructure';
import * as interfaces from '@interfaces';
import { AuthorizationController, JwksController, TokenController } from '@presentation';
import { IKeyLoader } from 'src/interfaces/services/rsa-key-loader.interface.js';

// El objeto de servicios puede ser redefinido en los tests
export const services = {
	// Core Services
	Clock: {} as interfaces.IClock,
	Config: {} as interfaces.IConfig,
	GracefulShutdown: {} as GracefulShutdown,
	HealthService: {} as interfaces.IHealthService,
	HttpServer: {} as interfaces.IHttpServer,
	Logger: {} as interfaces.ILogger,
	Uuid: {} as interfaces.IUuid,
	// Services
	JwtService: {} as interfaces.IJwtService,
	PkceVerifierService: {} as interfaces.IPKceVerifierService,
	HashService: {} as interfaces.IHashService,
	RsaKeyLoaderService: {} as IKeyLoader,
	JwksService: {} as interfaces.IJwksService,

	//Uses cases
	GenerateAuthCodeUseCase: {} as interfaces.IGenerateAuthCodeUseCase,
	ValidateClientUseCase: {} as interfaces.IValidateClientUseCase,
	ExchangeCodeFotTokenUseCase: {} as interfaces.IExchangeCodeForTokenUseCase,
	GetJwksUseCase: {} as interfaces.IGetJwksUseCase,

	//Repositories
	AuthCodeRepository: {} as interfaces.IAuthCodeRepository,
	OAuthClientRepository: {} as interfaces.IOAthClientRepository,
	TokenRepository: {} as interfaces.ITokenRepository,

	//Controllers
	AuthController: {} as AuthorizationController,
	TokenController: {} as TokenController,
	JwksController: {} as JwksController,
};

/**
 * Tipo de token válido para los servicios registrados
 */
export type Token = keyof typeof services;

/**
 * Mapeo de tokens a servicios, parametrizable para tests
 */
export type ServiceMap = { [K in Token]: (typeof services)[K] };

/**
 * Array de tokens disponibles, parametrizable para tests
 */
export const TOKENS = Object.keys(services) as Token[];

/**
 * Array de servicios críticos, parametrizable para tests
 */
export const criticalServices: Token[] = [...TOKENS];

/**
 * Creates an instance of the GetJwksUseCase using the provided container.
 *
 * @param c - The dependency injection container used to resolve required services.
 * @returns An instance of IGetJwksUseCase.
 */

export function createGetJwksUseCase(c: interfaces.IContainer): interfaces.IGetJwksUseCase {
	return new GetJwksUseCase(c.resolve('JwksService'));
}

/**
 * Creates and returns an instance of `IJwksService` using the provided container.
 *
 * This function resolves the `RsaKeyLoaderService` from the container,
 * retrieves the public key and key ID, and uses them to instantiate a new `JwksService`.
 *
 * @param c - The dependency injection container implementing `interfaces.IContainer`.
 * @returns An instance of `interfaces.IJwksService` initialized with the public key and key ID.
 */

export function createJwksService(c: interfaces.IContainer): interfaces.IJwksService {
	const loader = c.resolve('RsaKeyLoaderService');
	return new JwksService(loader.getPublicKey(), loader.getKeyId());
}
