import { Request, Response } from 'express';

import { NodeEnv } from '@interfaces';

/**
 * Represents the health status response of a dependency.
 *
 * @property status - The health status of the dependency, either 'healthy' or 'unhealthy'.
 * @property message - A descriptive message about the dependency's health status.
 * @property responseTime - Optional response time in milliseconds for the health check.
 */

export type IDependencyResponse = { status: 'healthy' | 'unhealthy'; message: string; responseTime?: number };

/**
 * Represents the health check response for a JWKS (JSON Web Key Set) service.
 *
 * @property status - Indicates the health status of the JWKS service. Can be 'healthy' or 'unhealthy'.
 * @property message - A descriptive message providing additional information about the health status.
 * @property keyCount - The number of keys currently available in the JWKS.
 * @property responseTime - The time taken to perform the health check.
 */
export interface IJwksHealthResponse {
	status: 'healthy' | 'unhealthy';
	message: string;
	keyCount: number;
	responseTime: number;
}

/**
 * Represents the system health information response containing memory usage and uptime statistics.
 *
 * @property {Object} memory - Memory usage statistics
 * @property {number} memory.used - Amount of memory currently being used (in bytes)
 * @property {number} memory.free - Amount of available free memory (in bytes)
 * @property {number} memory.total - Total system memory capacity (in bytes)
 * @property {number} memory.percentage - Percentage of memory being used (0-100)
 * @property {number} uptime - System uptime duration (in seconds)
 */

export type ISystemInfoResponse = { memory: { used: number; free: number; total: number; percentage: number }; uptime: number };

/**
 * Represents the response structure for health check endpoints.
 *
 * @interface IHealthResponse
 * @property {('healthy' | 'unhealthy' | 'degraded')} status - The current health status of the service
 * @property {string} timestamp - ISO 8601 timestamp of when the health check was performed
 * @property {string} service - The name or identifier of the service being checked
 * @property {string} version - The version of the service
 * @property {number} uptime - The service uptime in seconds
 * @property {string} requestId - Unique identifier for the health check request
 * @property {NodeEnv} environment - The environment in which the service is running (e.g., development, production)
 */

export interface IHealthResponse {
	status: 'healthy' | 'unhealthy' | 'degraded';
	timestamp: string;
	service: string;
	version: string;
	uptime: number;
	requestId: string;
	environment: NodeEnv;
}

//TODO documentar
export interface IDeepHealthResponse extends IHealthResponse {
	dependencies: Record<string, unknown>;
	jwks: IJwksHealthResponse;
	// TODO F2
	// database: IDatabaseHealthResponse;
	system: ISystemInfoResponse;
}

/**
 * Service interface for handling application health check operations.
 *
 * Provides methods to check the health status of the application and its dependencies,
 * supporting both simple and deep health checks.
 *
 * @interface IHealthService
 *
 * @example
 * ```typescript
 * class HealthService implements IHealthService {
 *   async getHealth(req: Request, res: Response): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 */

export interface IHealthService {
	getHealth(req: Request, res: Response): Promise<void>;
	getDeepHealth(req: Request, res: Response): Promise<void>;
	checkHealth<T extends 'simple' | 'deep'>(
		type: T,
		requestId: string,
		services: string[]
	): Promise<T extends 'deep' ? IDeepHealthResponse : IHealthResponse>;
}
