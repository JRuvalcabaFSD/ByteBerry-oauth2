import os from 'os';

import * as Interfaces from '@interfaces';
import { criticalServices, Token } from '@container';
import { getErrMsg, withLoggerContext } from '@shared';
import { Request, Response } from 'express';

//TODO documentar
export class HealthService implements Interfaces.IHealthService {
	private readonly config: Interfaces.IConfig;
	private readonly uuid: Interfaces.IUuid;
	private readonly clock: Interfaces.IClock;
	private readonly logger: Interfaces.ILogger;

	constructor(private readonly c: Interfaces.IContainer) {
		this.config = c.resolve('Config');
		this.uuid = c.resolve('Uuid');
		this.clock = c.resolve('Clock');
		this.logger = c.resolve('Logger');
	}

	/**
	 * Handles HTTP requests for basic health check of the service.
	 *
	 * Performs a simple health check on critical services and returns the status.
	 * The method generates or reuses a request ID for tracing purposes.
	 *
	 * @param req - Express request object containing the HTTP request details
	 * @param res - Express response object used to send the HTTP response
	 *
	 * @returns A promise that resolves when the response is sent
	 *
	 * @remarks
	 * - On success, returns a 200 status with health check response including:
	 *   - Request ID for tracing
	 *   - Overall status of critical services
	 *   - System uptime
	 * - On failure, delegates error handling to `handleHealthError` method
	 * - Logs debug information including request ID, status, and uptime
	 *
	 * @throws Errors are caught and handled internally by `handleHealthError`
	 */

	public getHealth = async (req: Request, res: Response): Promise<void> => {
		const ctxLogger = withLoggerContext(this.logger, 'HealthService.getHealth');
		try {
			const requestId = req.requestId || this.uuid.generate();
			const response = await this.checkHealth('simple', requestId, criticalServices);

			ctxLogger.debug('Health check completed', { requestId: response.requestId, status: response.status, uptime: response.uptime });
			res.status(200).json(response);
		} catch (error) {
			await this.handleHealthError(req, res, error as Error, 'basic');
		}
	};

	/**
	 * Performs a deep health check of the system and its critical dependencies.
	 *
	 * This endpoint checks the health status of critical services and returns a detailed
	 * health report including the status of all dependencies, response time, and request tracking.
	 *
	 * @param req - Express request object. May contain a `requestId` property for request tracking.
	 * @param res - Express response object used to send the health check results.
	 *
	 * @returns A Promise that resolves when the health check is complete and response is sent.
	 *
	 * @remarks
	 * - Returns HTTP 200 if status is 'healthy' or 'degraded'
	 * - Returns HTTP 503 if status is unhealthy
	 * - Logs the health check completion with metrics including response time and dependencies count
	 * - Automatically generates a requestId if not provided in the request
	 * - Delegates error handling to `handleHealthError` method
	 *
	 * @throws Will be caught internally and handled by `handleHealthError`
	 */

	public getDeepHealth = async (req: Request, res: Response): Promise<void> => {
		const ctxLogger = withLoggerContext(this.logger, 'HealthService.getDeepHealth');

		try {
			const requestId = req.requestId || this.uuid.generate();
			const startTime = Math.floor(process.uptime() * 1000);

			const response = await this.checkHealth('deep', requestId, criticalServices);

			ctxLogger.info('Deep health check completed', {
				requestId: response.requestId,
				status: response.status,
				responseTime: this.clock.timestamp() - startTime,
				dependenciesCount: Object.keys(response.dependencies).length,
				// TODO F2
				// databaseConnected: response.database?.connected ?? false,
			});

			const statusCode = response.status === 'healthy' ? 200 : response.status === 'degraded' ? 200 : 503;
			res.status(statusCode).json(response);
		} catch (error) {
			await this.handleHealthError(req, res, error as Error, 'basic');
		}
	};

	/**
	 * Performs a health check on the service and its dependencies.
	 *
	 * @param type - The type of health check to perform. Use 'simple' for basic status or 'deep' for detailed diagnostics.
	 * @param requestId - A unique identifier for tracking the health check request.
	 * @param services - An array of service names to check as dependencies.
	 *
	 * @returns A promise that resolves to either a simple health response or a deep health response based on the type parameter.
	 * - For 'simple': Returns basic health information including status, timestamp, service name, version, uptime, requestId, and environment.
	 * - For 'deep': Returns comprehensive health information including all simple response fields plus dependencies status and system information.
	 *
	 * @remarks
	 * The overall status is determined by aggregating the status of all checked dependencies.
	 * Database health check is currently disabled (TODO F2).
	 *
	 * @example
	 * ```typescript
	 * // Simple health check
	 * const simpleHealth = await checkHealth('simple', 'req-123', ['auth', 'cache']);
	 *
	 * // Deep health check
	 * const deepHealth = await checkHealth('deep', 'req-456', ['auth', 'cache', 'queue']);
	 * ```
	 */

	public async checkHealth(type: 'simple', requestId: string, services: string[]): Promise<Interfaces.IHealthResponse>;
	public async checkHealth(type: 'deep', requestId: string, services: string[]): Promise<Interfaces.IDeepHealthResponse>;
	public async checkHealth(
		type: 'simple' | 'deep',
		requestId: string,
		services: string[]
	): Promise<Interfaces.IHealthResponse | Interfaces.IDeepHealthResponse> {
		const dependencies = await this.checkDependencies(services);
		const systemInfo = this.getSystemInfo();
		const overallStatus = this.determineOverallStatus(dependencies);

		const response: Partial<Interfaces.IDeepHealthResponse> = {
			status: overallStatus,
			timestamp: this.clock.isoString(),
			service: this.config.serviceName,
			version: this.config.version,
			uptime: Math.floor(process.uptime() * 1000),
			requestId,
			environment: this.config.nodeEnv,
		};

		if (type === 'deep') {
			response.dependencies = dependencies;
			// TODO F2
			// response.database = await this.checkDatabaseHealth();
			response.system = systemInfo;
			return response as Interfaces.IDeepHealthResponse;
		}

		return response as Interfaces.IHealthResponse;
	}

	/**
	 * Checks the health status of multiple service dependencies by verifying their registration
	 * and resolution in the dependency injection container.
	 *
	 * @param services - An array of service identifiers (tokens) to check
	 * @returns A promise that resolves to a record mapping service names to their health status,
	 *          including status ('healthy' or 'unhealthy'), descriptive message, and response time in milliseconds
	 *
	 * @remarks
	 * The method performs the following checks for each service:
	 * - If container supports `isRegistered`, verifies the service is registered
	 * - Attempts to resolve the service from the container
	 * - Measures response time for each check
	 * - Returns 'unhealthy' status if service is not registered, fails to resolve, or throws an error
	 * - Returns 'healthy' status if service is successfully resolved
	 *
	 * @example
	 * ```typescript
	 * const dependencies = await checkDependencies(['UserService', 'DatabaseService']);
	 * // Returns:
	 * // {
	 * //   'UserService': { status: 'healthy', message: '...', responseTime: 5 },
	 * //   'DatabaseService': { status: 'unhealthy', message: '...', responseTime: 3 }
	 * // }
	 * ```
	 */

	private async checkDependencies(services: string[]): Promise<Record<string, Interfaces.IDependencyResponse>> {
		const dependencies: Record<string, Interfaces.IDependencyResponse> = {};

		for (const service of services) {
			const startTime = this.clock.timestamp();

			try {
				const isRegisteredFn = (this.c as unknown as { isRegistered?: (t: Token) => boolean }).isRegistered;

				if (typeof isRegisteredFn === 'function') {
					const registered = isRegisteredFn.call(this.c, service as Token);

					if (!registered) {
						dependencies[service] = {
							status: 'unhealthy',
							message: `${service} service is not registered in container`,
							responseTime: this.clock.timestamp() - startTime,
						};

						continue;
					}

					const resolvedService = this.c.resolve(service as Token);
					if (!resolvedService) {
						dependencies[service] = {
							status: 'unhealthy',
							message: `${service} service resolved null/undefined`,
							responseTime: this.clock.timestamp() - startTime,
						};

						continue;
					}

					dependencies[service] = {
						status: 'healthy',
						message: `${service} service is available and operational`,
						responseTime: this.clock.timestamp() - startTime,
					};
				} else {
					const resolveService = this.c.resolve(service as Token);
					if (!resolveService) {
						dependencies[service] = {
							status: 'unhealthy',
							message: `${service} service resolved null/undefined`,
							responseTime: this.clock.timestamp() - startTime,
						};
						continue;
					}
					dependencies[service] = {
						status: 'healthy',
						message: `${service} service is available and operational`,
						responseTime: this.clock.timestamp() - startTime,
					};
				}
			} catch (error) {
				dependencies[service] = {
					status: 'unhealthy',
					message: `${service} service check failed: ${getErrMsg(error)}`,
					responseTime: this.clock.timestamp() - startTime,
				};
			}
		}
		return dependencies;
	}

	/**
	 * Retrieves current system information including memory usage and uptime.
	 *
	 * Calculates memory statistics by examining total system memory, free memory,
	 * and derived used memory. The percentage is calculated as (used/total * 100)
	 * and rounded to the nearest integer.
	 *
	 * @returns {Interfaces.ISystemInfoResponse} An object containing:
	 *   - memory: Object with used, free, total memory in bytes and usage percentage
	 *   - uptime: System uptime in seconds
	 *
	 * @private
	 */

	private getSystemInfo(): Interfaces.ISystemInfoResponse {
		const totalMemory = os.totalmem();
		const freeMemory = os.freemem();
		const usedMemory = totalMemory - freeMemory;

		return {
			memory: {
				used: usedMemory,
				free: freeMemory,
				total: totalMemory,
				percentage: Math.round((usedMemory / totalMemory) * 100),
			},
			uptime: os.uptime(),
		};
	}

	/**
	 * Determines the overall health status based on the statuses of all dependencies.
	 *
	 * @param dependencies - A record of dependency responses, where each key is a dependency name
	 *                       and each value contains the dependency's health status information.
	 *
	 * @returns The overall health status:
	 *          - 'healthy': All dependencies are healthy
	 *          - 'unhealthy': At least one dependency is unhealthy
	 *          - 'degraded': No dependencies are unhealthy, but at least one is not healthy
	 *
	 * @private
	 */

	private determineOverallStatus(dependencies: Record<string, Interfaces.IDependencyResponse>): 'healthy' | 'unhealthy' | 'degraded' {
		const statuses = Object.values(dependencies).map((dep) => dep.status);

		if (statuses.every((status) => status === 'healthy')) {
			return 'healthy';
		} else if (statuses.some((status) => status === 'unhealthy')) {
			return 'unhealthy';
		} else {
			return 'degraded';
		}
	}

	/**
	 * Handles errors that occur during health check operations and sends an appropriate error response.
	 *
	 * This method logs the error details and returns a 503 Service Unavailable status with health
	 * information. If an error occurs while processing the health check error (e.g., config access fails),
	 * a safe fallback response is provided.
	 *
	 * @param req - The Express request object containing optional requestId
	 * @param res - The Express response object used to send the error response
	 * @param error - The error that occurred during the health check
	 * @param type - The type of health check that failed ('basic' or 'deep')
	 * @returns A promise that resolves when the error response has been sent
	 *
	 * @remarks
	 * - Generates a new requestId if one is not present in the request
	 * - Logs error details including message, stack trace, and requestId
	 * - Returns a 503 status code with partial health response data
	 * - Provides a safe fallback response if the error handling itself fails
	 * - The fallback response avoids accessing this.config to prevent cascading failures
	 */

	public async handleHealthError(req: Request, res: Response, error: Error, type: 'basic' | 'deep'): Promise<void> {
		try {
			const requestId = req.requestId || this.uuid.generate();

			this.logger.error(`${type} health check failed`, {
				requestId,
				error: error.message,
				stack: error.stack,
			});

			const errorResponse: Partial<Interfaces.IHealthResponse> = {
				status: 'unhealthy',
				timestamp: this.clock.isoString(),
				service: this.config.serviceName,
				version: this.config.version,
				uptime: Math.floor(process.uptime() * 1000),
				requestId,
			};

			res.status(503).json(errorResponse);
		} catch (_) {
			// Fallback response: do NOT access this.config here because tests may install
			// getters that throw when reading config; return a safe static fallback instead.
			res.status(503).json({
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				service: undefined,
				version: '0.0.0',
				uptime: 0,
				error: 'Health check system failure',
			});
		}
	}
}
