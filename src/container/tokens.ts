import { GracefulShutdown } from '@infrastructure';
import * as interfaces from '@interfaces';
import { AuthorizationController } from '@presentation';

// El objeto de servicios puede ser redefinido en los tests
export const services = {
	Config: {} as interfaces.IConfig,
	Clock: {} as interfaces.IClock,
	Logger: {} as interfaces.ILogger,
	Uuid: {} as interfaces.IUuid,
	HttpServer: {} as interfaces.IHttpServer,
	GracefulShutdown: {} as GracefulShutdown,
	HealthService: {} as interfaces.IHealthService,
	GenerateAuthCodeUseCase: {} as interfaces.IGenerateAuthCodeUseCase,
	ValidateClientUseCase: {} as interfaces.IValidateClientUseCase,
	AuthCodeRepository: {} as interfaces.IAuthCodeRepository,
	OAuthClientRepository: {} as interfaces.IOAthClientRepository,
	AuthController: {} as AuthorizationController,
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
