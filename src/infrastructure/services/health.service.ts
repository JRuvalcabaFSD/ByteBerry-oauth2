import { Request, Response } from 'express';
import os from 'os';

import * as Interfaces from '@/interfaces';
import { getErrMsg, LogContextClass, withLoggerContext } from '@/shared';
import { criticalServices, Token } from '@/container';

/**
 * Controller responsible for handling health check endpoints.
 *
 * Provides two types of health checks:
 * - Simple health check: Returns basic service status and uptime information
 * - Deep health check: Returns detailed service status including dependencies and system information
 *
 * The controller evaluates the health status of registered services and system resources,
 * determining an overall health status of 'healthy', 'degraded', or 'unhealthy'.
 *
 * @implements {Interfaces.IHealthService}
 *
 * @example
 * ```typescript
 * const HealthService = new HealthService(container);
 * app.get('/health', HealthService.getHealth);
 * app.get('/health/deep', HealthService.getDeepHealth);
 * ```
 */

@LogContextClass()
export class HealthService implements Interfaces.IHealthService {
  private readonly config: Interfaces.IConfig;
  private readonly uuid: Interfaces.IUuid;
  private readonly clock: Interfaces.IClock;
  private readonly logger: Interfaces.ILogger;
  private readonly dbCheck: Interfaces.IDatabaBaseHealthChecker;

  /**
   * Creates an instance of the health controller.
   *
   * @param container - The dependency injection container used to resolve dependencies
   *
   * @remarks
   * This constructor resolves the following dependencies from the container:
   * - Config: Application configuration
   * - Uuid: UUID generator service
   * - Clock: Clock/time service
   * - Logger: Logging service
   */

  constructor(private readonly container: Interfaces.IContainer) {
    this.config = this.container.resolve('Config');
    this.uuid = this.container.resolve('Uuid');
    this.clock = this.container.resolve('Clock');
    this.logger = this.container.resolve('Logger');
    this.dbCheck = this.container.resolve('DatabaseHealthChecker');
  }

  /**
   * Handles HTTP GET requests for basic health check endpoint.
   *
   * Performs a simple health check by verifying the status of critical services
   * and returns the overall health status of the application including uptime information.
   *
   * @param req - Express request object, may contain a requestId property
   * @param res - Express response object used to send the health check result
   * @returns Promise that resolves when the response has been sent
   *
   * @remarks
   * - Generates a new requestId if one is not present in the request
   * - Checks critical services using the 'simple' check type
   * - Logs health check completion with relevant metadata
   * - Returns 200 status code with health information on success
   * - Delegates error handling to handleHealthError method
   *
   * @throws Will catch and handle any errors through handleHealthError
   */

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    const ctxLogger = withLoggerContext(this.logger, 'HealthService.getHealth');

    try {
      const requestId = req.requestId || this.uuid.generate();
      const response = await this.checkHealth('simple', requestId, criticalServices);

      ctxLogger.info('Health check completed', { requestId: response.requestId, status: response.status, uptime: response.uptime });
      res.status(200).json(response);
    } catch (error) {
      await this.handleHealthError(req, res, error as Error, 'basic');
    }
  };

  /**
   * Performs a deep health check of the application and its critical dependencies.
   *
   * This endpoint checks the health status of all critical services and returns
   * a comprehensive health report including dependency statuses, response times,
   * and overall system health.
   *
   * @param req - Express request object, optionally containing a requestId
   * @param res - Express response object used to send the health check result
   *
   * @returns A Promise that resolves when the response has been sent
   *
   * @remarks
   * - Generates a unique requestId if not provided in the request
   * - Logs detailed information about the health check execution
   * - Returns HTTP 200 for 'healthy' or 'degraded' status
   * - Returns HTTP 503 for 'unhealthy' status
   * - Errors are handled by the {@link handleHealthError} method
   *
   * @example
   * Response structure:
   * ```json
   * {
   *   "requestId": "uuid",
   *   "status": "healthy" | "degraded" | "unhealthy",
   *   "dependencies": { ... }
   * }
   * ```
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
        databaseConnected: response.database?.connected ?? false,
      });

      const statusCode = response.status === 'healthy' ? 200 : response.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(response);
    } catch (error) {
      await this.handleHealthError(req, res, error as Error, 'basic');
    }
  };

  /**
   * Checks the health status of the service and its dependencies.
   *
   * @param type - The type of health check to perform. Use 'simple' for basic status or 'deep' for detailed information including dependencies and system metrics.
   * @param requestId - A unique identifier for tracking this health check request.
   * @param services - An array of service names to check as dependencies.
   *
   * @returns A promise that resolves to either a basic health response (for 'simple' checks) or a detailed health response (for 'deep' checks) containing status, timestamp, service information, and optionally dependency and system information.
   *
   * @remarks
   * - For 'simple' checks, returns basic service status, timestamp, version, uptime, and environment.
   * - For 'deep' checks, additionally includes dependency statuses and system information.
   * - The overall status is determined based on the health of all checked dependencies.
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
      response.database = await this.checkDatabaseHealth();
      response.system = systemInfo;
      return response as Interfaces.IDeepHealthResponse;
    }

    return response as Interfaces.IHealthResponse;
  }

  /**
   * Checks the health status of multiple service dependencies by verifying their registration
   * and resolution in the dependency injection container.
   *
   * @param services - An array of service names/tokens to check
   * @returns A promise that resolves to a record mapping service names to their health status,
   *          including status ('healthy' or 'unhealthy'), descriptive message, and response time in milliseconds
   *
   * @remarks
   * This method performs the following checks for each service:
   * - Verifies if the service is registered in the container (if `isRegistered` method is available)
   * - Attempts to resolve the service from the container
   * - Measures the response time for each check
   * - Handles errors gracefully and reports them in the dependency status
   *
   * Services are marked as 'unhealthy' if:
   * - They are not registered in the container
   * - They resolve to null or undefined
   * - An error occurs during the check
   *
   * @example
   * ```typescript
   * const services = ['DatabaseService', 'CacheService'];
   * const healthStatus = await checkDependencies(services);
   * // Returns: { 'DatabaseService': { status: 'healthy', message: '...', responseTime: 5 }, ... }
   * ```
   */

  private async checkDependencies(services: string[]): Promise<Record<string, Interfaces.IDependencyResponse>> {
    const dependencies: Record<string, Interfaces.IDependencyResponse> = {};

    for (const service of services) {
      const startTime = this.clock.timestamp();

      try {
        const isRegisteredFn = (this.container as unknown as { isRegistered?: (t: Token) => boolean }).isRegistered;

        if (typeof isRegisteredFn === 'function') {
          const registered = isRegisteredFn.call(this.container, service as Token);

          if (!registered) {
            dependencies[service] = {
              status: 'unhealthy',
              message: `${service} service is not registered in container`,
              responseTime: this.clock.timestamp() - startTime,
            };

            continue;
          }

          const resolvedService = this.container.resolve(service as Token);
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
          const resolveService = this.container.resolve(service as Token);
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
   * Retrieves system information including memory usage and uptime.
   *
   * Calculates the current memory statistics by determining used, free, and total memory,
   * along with the percentage of memory currently in use. Also includes system uptime.
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
   * Determines the overall health status based on the status of all dependencies.
   *
   * @param dependencies - A record of dependency names mapped to their health check responses
   * @returns The overall status:
   *          - 'healthy' if all dependencies are healthy
   *          - 'unhealthy' if any dependency is unhealthy
   *          - 'degraded' if no dependencies are unhealthy but at least one is not healthy
   */

  private determineOverallStatus(dependencies: Record<string, Interfaces.IDependencyResponse>): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(dependencies).map(dep => dep.status);

    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'unhealthy')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  /**
   * Checks the health status of the database by invoking the DataBaseHealthChecker service.
   *
   * This method returns a promise that resolves to an object containing information about the database connection,
   * latency, and the availability of specific tables. If the health checker is not available or an error occurs,
   * it returns a default response indicating the database is not connected and logs the error.
   *
   * @returns {Promise<Interfaces.IDatabaseHealthResponse>} A promise that resolves to the database health status.
   */

  private async checkDatabaseHealth(): Promise<Interfaces.IDatabaseHealthResponse> {
    const defaultResponse: Interfaces.IDatabaseHealthResponse = {
      connected: false,
      latency: 0,
      tables: {
        users: false,
        oAuthClients: false,
        authCodes: false,
        refreshTokens: false,
      },
    };

    try {
      if (!this.dbCheck) {
        this.logger.warn('DataBaseHealthChecker not available in container');
        return defaultResponse;
      }

      const healthStatus = await this.dbCheck.getHealthStatus();

      this.logger.debug('Database health check completed via DataBaseHealthCheckerService', {
        connected: healthStatus.connected,
        latency: healthStatus.latency,
      });

      return healthStatus;
    } catch (error) {
      this.logger.error('Database health check failed', {
        error: getErrMsg(error),
      });

      return {
        ...defaultResponse,
        error: getErrMsg(error),
      };
    }
  }

  /**
   * Handles errors that occur during health check operations and sends an appropriate error response.
   *
   * This method logs the health check failure and returns a 503 Service Unavailable status with
   * details about the unhealthy state. If the error handling itself fails, it provides a safe
   * fallback response without accessing potentially problematic configuration values.
   *
   * @param req - The Express request object containing the incoming HTTP request
   * @param res - The Express response object used to send the HTTP response
   * @param error - The error that occurred during the health check
   * @param type - The type of health check that failed, either 'basic' or 'deep'
   * @returns A promise that resolves when the error response has been sent
   *
   * @remarks
   * The method implements a two-tier error handling strategy:
   * - Primary: Attempts to log the error and return a detailed unhealthy status
   * - Fallback: If the primary handler fails, returns a minimal static response to prevent cascading failures
   *
   * The fallback response intentionally avoids accessing `this.config` to prevent errors in test environments
   * where config getters may throw exceptions.
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
