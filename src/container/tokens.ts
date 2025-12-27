import { GracefulShutdown, KeyLoader } from '@infrastructure';
import * as Interfaces from '@interfaces';
import { AuthCodeController, JwksController, LoginController, TokenController } from '@presentation';

//TODO documentar
export const Services = {
	// Core Services
	Config: {} as Interfaces.IConfig,
	Clock: {} as Interfaces.IClock,
	UUid: {} as Interfaces.IUuid,
	Logger: {} as Interfaces.ILogger,
	HttpServer: {} as Interfaces.IHttpServer,
	HealthService: {} as Interfaces.IHealthService,
	GracefulShutdown: {} as GracefulShutdown,

	//Oauth Services
	HashService: {} as Interfaces.IHashService,
	KeyLoaderService: {} as KeyLoader,
	JwtService: {} as Interfaces.IJwtService,
	JwksService: {} as Interfaces.IJwksService,

	//Repositories
	UserRepository: {} as Interfaces.IUserRepository,
	SessionRepository: {} as Interfaces.ISessionRepository,
	AuthCodeRepository: {} as Interfaces.IAuthCodeRepository,
	OAuthClientRepository: {} as Interfaces.IOAuthClientRepository,

	//Use Cases
	LoginUserCase: {} as Interfaces.ILoginUseCase,
	GenerateAuthCodeUseCase: {} as Interfaces.IGenerateAuthCodeUseCase,
	ValidateClientUseCase: {} as Interfaces.IValidateClientUseCase,
	PKCEVerifierUseCase: {} as Interfaces.IPkceVerifierUseCase,
	ExchangeTokenUseCase: {} as Interfaces.IExchangeTokenUseCase,
	GetJWksUseCase: {} as Interfaces.IGetJwksUseCase,

	//Controllers
	LoginController: {} as LoginController,
	AuthCodeController: {} as AuthCodeController,
	TokenController: {} as TokenController,
	JwksController: {} as JwksController,
};

/**
 * Represents the valid keys of the `Services` object.
 *
 * This type is used to refer to the names of services registered in the `Services` container.
 * It ensures type safety when accessing or referencing service tokens.
 */

export type Token = keyof typeof Services;

/**
 * Maps each `Token` to its corresponding service type from the `Services` object.
 *
 * This type is useful for strongly-typed dependency injection containers,
 * ensuring that each token is associated with the correct service implementation.
 *
 * @template K - A key of the `Token` union type.
 */

export type ServiceMap = { [K in Token]: (typeof Services)[K] };

/**
 * An array of token identifiers derived from the keys of the `Services` object.
 *
 * @remarks
 * This constant provides a strongly-typed list of all available service tokens,
 * ensuring type safety by casting the keys to the `Token` type.
 *
 * @see Services
 * @see Token
 */

export const TOKENS = Object.keys(Services) as Token[];

/**
 * An array of tokens representing critical services required by the application.
 *
 * This constant aggregates all tokens defined in the `TOKENS` array and exposes them
 * as `criticalServices` for use in dependency injection or service resolution.
 *
 * @remarks
 * Modify the `TOKENS` array to update the list of critical services.
 *
 * @see Token
 * @see TOKENS
 */

export const criticalServices: Token[] = [...TOKENS];
