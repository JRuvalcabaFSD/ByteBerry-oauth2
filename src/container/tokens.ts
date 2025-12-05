import { GracefulShutdown } from '@infrastructure';
import { IClock, IConfig, IHttpServer, ILogger, IUuid } from '@interfaces';

// El objeto de servicios puede ser redefinido en los tests
export const services = {
	Config: {} as IConfig,
	Clock: {} as IClock,
	Logger: {} as ILogger,
	Uuid: {} as IUuid,
	HttpServer: {} as IHttpServer,
	GracefulShutdown: {} as GracefulShutdown,
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
