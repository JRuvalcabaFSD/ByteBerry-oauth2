import { IConfig } from '@interfaces';

// El objeto de servicios puede ser redefinido en los tests
export const services: Record<string, unknown> = { Config: {} as IConfig };

/**
 * Tipo de token válido para los servicios registrados
 */
export type Token<T extends Record<string, unknown> = typeof services> = keyof T;

/**
 * Mapeo de tokens a servicios, parametrizable para tests
 */
export type ServiceMap<T extends Record<string, unknown> = typeof services> = {
	[K in keyof T]: T[K];
};

/**
 * Array de tokens disponibles, parametrizable para tests
 */
export const TOKENS = (): string[] => Object.keys(services);

/**
 * Array de servicios críticos, parametrizable para tests
 */
export const criticalServices = (): string[] => [...TOKENS()];
