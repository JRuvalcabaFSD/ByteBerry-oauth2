import os from 'os';
import { Request, Response } from 'express';
import { criticalServices, ServiceMap, Token } from '@/container';
import * as Interfaces from '@/interfaces';
import { getErrorMessage, withLoggerContext } from '@/shared';

/**
 * HealthController
 *
 * Exposes HTTP endpoints and utilities for performing both a lightweight ("basic")
 * health check and a comprehensive ("deep") health check of the service.
 *
 * The controller relies on a dependency injection container to resolve the following
 * services at construction time:
 * - "Config" (service metadata: name, version, nodeEnv)
 * - "Clock" (time helpers: isoString, timestamp)
 * - "Uuid" (request id generation)
 * - "Logger" (structured logging)
 *
 * Behavior summary
 * - getHealth(req, res)
 *   - Performs a fast, non-blocking health report.
 *   - Responds 200 with a minimal IHealthResponse when successful.
 *   - On error, logs and responds 503 with an "unhealthy" health response and
 *     delegates to handleHealthError for consistent error handling.
 *
 * - getDeepHealth(req, res)
 *   - Performs a comprehensive health check that:
 *     - inspects critical application dependencies via checkDependencies()
 *     - collects runtime/system information via getSystemInfo()
 *     - computes an overall status via determineOverallStatus()
 *   - Returns 200 for "healthy" or "degraded", and 503 for "unhealthy".
 *   - Logs timing and dependency counts. On error delegates to handleHealthError.
 *
 * - checkDependencies()
 *   - Iterates over criticalServices and attempts to resolve each token from the
 *     DI container. For each dependency it records status, a human-readable message,
 *     and a responseTime (milliseconds measured using the injected Clock).
 *   - Treats unresolved services or thrown errors as "unhealthy".
 *
 * - getSystemInfo()
 *   - Returns basic OS-level telemetry (memory usage and system uptime).
 *
 * - determineOverallStatus(dependencies)
 *   - Aggregates individual dependency statuses:
 *     - "healthy" if all dependencies are healthy
 *     - "unhealthy" if any dependency is unhealthy
 *     - "degraded" otherwise
 *
 * - handleHealthError(req, res, error, type)
 *   - Centralized error handling for health endpoints.
 *   - Logs the error (message + stack) with a requestId and returns a 503 response
 *     containing a minimal health error payload. If error handling itself fails,
 *     returns a minimal fallback 503 response with static fallback values.
 *
 * Side effects
 * - Writes HTTP responses (res.status(...).json(...)).
 * - Produces structured logs via the injected Logger.
 * - Generates request IDs using the injected Uuid when one is not present on the request.
 *
 * Note / Implementation details
 * - The controller prefers an existing req.requestId and falls back to a generated UUID.
 * - Response time measurements use the injected Clock.timestamp(); uptime values use process.uptime()
 *   (converted to milliseconds) and/or os.uptime() for system uptime.
 * - checkDependencies assumes the presence of a `criticalServices` iterable in scope and that
 *   each entry can be used as a DI token to resolve a service instance.
 *
 * Usage example
 * - Intended to be registered as route handlers in an Express-like HTTP server:
 *   - GET /health  -> controller.getHealth
 *   - GET /health/deep -> controller.getDeepHealth
 *
 * @remarks
 * This TSDoc documents the class-level contract and behaviors. Refer to the
 * concrete method signatures for parameter and return types (Request, Response, Promise<void>).
 *
 * @public
 */

export class HealthController implements Interfaces.IHealthController {
  private readonly config: Interfaces.IConfig;
  private readonly uuid: Interfaces.IUuid;
  private readonly clock: Interfaces.IClock;
  private readonly logger: Interfaces.ILogger;

  /**
   * Constructs the controller and resolves its runtime dependencies from the provided DI container.
   *
   * @param container - Dependency injection container implementing Interfaces.IContainer<ServiceMap>.
   *   The constructor resolves and assigns the following services from the container:
   *   - "Config"  : application configuration
   *   - "Clock"   : clock/time provider
   *   - "Uuid"    : UUID generator
   *   - "Logger"  : logging facility
   *
   * @remarks
   * The container must have the above services registered. If any service is not available,
   * resolution may throw an error depending on the container implementation.
   */
  constructor(private readonly container: Interfaces.IContainer<ServiceMap>) {
    this.config = this.container.resolve('Config');
    this.clock = this.container.resolve('Clock');
    this.uuid = this.container.resolve('Uuid');
    this.logger = this.container.resolve('Logger');
  }

  /**
   * Handles a health check request and returns a JSON health response.
   *
   * Constructs a logger context and attempts to produce a health payload containing
   * status, timestamp, service name, version, uptime (ms), requestId, and environment.
   * On success it logs an info entry and responds with HTTP 200 and an Interfaces.IHealthResponse JSON body.
   * On failure it logs an error entry, responds with HTTP 503 with an "unhealthy" JSON payload
   * (including an error message and a timestamp), and delegates additional error handling to handleHealthError.
   *
   * Notes:
   * - A requestId is read from req.requestId when present; otherwise a new UUID is generated.
   * - Uptime is computed from process.uptime() and returned in milliseconds.
   * - The healthy response timestamp uses this.clock.isoString(); the failure response uses new Date().toISOString().
   * - The method performs side effects: writing an HTTP response and logging via the controller's logger.
   *
   * @param req - Express Request; may optionally include req.requestId (used or replaced with a generated UUID).
   * @param res - Express Response used to send the JSON health payload and HTTP status.
   * @returns A Promise that resolves once the response has been sent (Promise<void>).
   * @throws Any error encountered while building the health response is caught, logged, and results in a 503 response;
   *         additional error handling is invoked via this.handleHealthError.
   */

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    const ctxLogger = withLoggerContext(this.logger, 'HealthController.getHealth');

    try {
      const requestId = req.requestId || this.uuid.generate();
      const uptime = Math.floor(process.uptime() * 1000);

      const response: Interfaces.IHealthResponse = {
        status: 'healthy',
        timestamp: this.clock.isoString(),
        service: this.config.serviceName,
        version: this.config.version,
        uptime,
        requestId,
        environment: this.config.nodeEnv,
      };

      ctxLogger.info('Health check completed', { requestId, status: response.status, uptime });
      res.status(200).json(response);
    } catch (error) {
      const requestId = req.requestId || this.uuid.generate();

      ctxLogger.error('Health check failed', { error: getErrorMessage(error), requestId });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: this.config.serviceName,
        requestId,
        error: getErrorMessage(error),
      });

      await this.handleHealthError(req, res, error as Error, 'basic');
    }
  };

  /**
   * Performs a deep health check and sends a detailed health response.
   *
   * This handler:
   * - Establishes a logger context for the request.
   * - Ensures a requestId is present (generates one if missing).
   * - Records start time and computes response time for logging.
   * - Invokes `checkDependencies()` to evaluate dependent services/components.
   * - Gathers system information via `getSystemInfo()`.
   * - Determines an overall status using `determineOverallStatus(dependencies)`.
   * - Constructs an `IDeepHealthResponse` containing status, timestamps, service metadata,
   *   uptime, environment, dependency statuses, and system info.
   * - Logs the result with requestId, overall status, response time, and dependency count.
   * - Sends HTTP 200 for "healthy" or "degraded" statuses, otherwise HTTP 503.
   * - On error, delegates handling to `handleHealthError(req, res, error, 'basic')`.
   *
   * @param req - Express request object; may already contain `requestId`.
   * @param res - Express response object used to send the JSON health payload.
   * @returns A Promise that resolves when the response has been sent.
   *
   * @remarks
   * - Timestamps and uptime are provided in milliseconds.
   * - The response `version` currently uses `config.serviceName`.
   * - Dependencies are represented as a map and their count is logged.
   * - All runtime errors are caught and forwarded to the centralized error handler.
   */

  public getDeepHealth = async (req: Request, res: Response): Promise<void> => {
    const ctxLogger = withLoggerContext(this.logger, 'HealthController.getDeepHealth');

    try {
      const requestId = req.requestId || this.uuid.generate();
      const startTime = Math.floor(process.uptime() * 1000);

      const dependencies = await this.checkDependencies();
      const systemInfo = this.getSystemInfo();
      const overallStatus = this.determineOverallStatus(dependencies);

      const deepHealthResponse: Interfaces.IDeepHealthResponse = {
        status: overallStatus,
        timestamp: this.clock.isoString(),
        service: this.config.serviceName,
        version: this.config.version,
        uptime: Math.floor(process.uptime() * 1000),
        requestId,
        environment: this.config.nodeEnv,
        dependencies,
        system: systemInfo,
      };

      ctxLogger.info('Deep health check completed', {
        requestId,
        status: overallStatus,
        responseTime: this.clock.timestamp() - startTime,
        dependenciesCount: Object.keys(dependencies).length,
      });
      const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
      res.status(statusCode).json(deepHealthResponse);
    } catch (error) {
      await this.handleHealthError(req, res, error as Error, 'basic');
    }
  };

  /**
   * Checks the availability of application-critical services registered in the DI container.
   *
   * Iterates over the global `criticalServices` list and for each service:
   * - Records a start timestamp using `this.clock.timestamp()`.
   * - Attempts to resolve the service from `this.container` (using `service` as a token).
   * - If the service is not registered or resolves to a falsy value, marks the dependency as
   *   "unhealthy" with an appropriate message.
   * - If resolution succeeds, marks the dependency as "healthy".
   * - On any thrown error during resolution, marks the dependency as "unhealthy" and includes
   *   the error message (via `getErrorMessage`).
   * - Records the elapsed response time as `this.clock.timestamp() - startTime`.
   *
   * The returned record maps the original service identifier (token/name) to an
   * Interfaces.IDependencyResponse object describing its status, a human-readable
   * message, and the measured response time in milliseconds.
   *
   * Notes:
   * - This method swallows resolution errors and reports them in the returned map; it does not
   *   rethrow exceptions.
   * - The implementation depends on `this.container`, `this.clock`, `criticalServices`, and
   *   `getErrorMessage` being available in the surrounding scope.
   *
   * @private
   * @returns Promise<Record<string, Interfaces.IDependencyResponse>> A mapping from each service
   *          identifier to its health check result. Each result contains:
   *          - `status`: "healthy" | "unhealthy"
   *          - `message`: string with details about the check result or error
   *          - `responseTime`: number (elapsed time in milliseconds for the check)
   *
   * @example
   * // const deps = await this.checkDependencies();
   * // console.log(deps['DatabaseService'].status);
   */

  private async checkDependencies(): Promise<Record<string, Interfaces.IDependencyResponse>> {
    const dependencies: Record<string, Interfaces.IDependencyResponse> = {};

    for (const service of criticalServices) {
      const startTime = this.clock.timestamp();

      try {
        const isRegisteredFn = (this.container as unknown as { isRegistered?: (t: Token) => boolean }).isRegistered;

        if (typeof isRegisteredFn === 'function') {
          // Usar isRegistered para distinguir entre no registrado vs registrado pero null
          const registered = isRegisteredFn.call(this.container, service as Token);
          if (!registered) {
            dependencies[service] = {
              status: 'unhealthy',
              message: `${service} service is not registered in container`,
              responseTime: this.clock.timestamp() - startTime,
            };
            continue;
          }

          // Servicio registrado - verificar si resuelve correctamente
          const resolvedService = this.container.resolve(service as Token);
          if (!resolvedService) {
            // CORREGIDO: !resolvedService en lugar de === null
            dependencies[service] = {
              status: 'unhealthy',
              message: `${service} service resolved to null/undefined`,
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
          // Fallback: sin isRegistered, solo verificar resolución
          const resolvedService = this.container.resolve(service as Token);
          if (!resolvedService) {
            // CORREGIDO: !resolvedService en lugar de === null
            dependencies[service] = {
              status: 'unhealthy',
              message: `${service} service resolved to null/undefined`,
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
          message: `${service} service check failed: ${getErrorMessage(error)}`,
          responseTime: this.clock.timestamp() - startTime,
        };
      }
    }
    return dependencies;
  }

  /**
   * Collects a snapshot of the system's memory usage and uptime.
   *
   * The returned object conforms to Interfaces.ISystemInfoResponse and contains:
   * - memory.used: number — used memory in bytes (calculated as total - free).
   * - memory.free: number — free memory in bytes.
   * - memory.total: number — total system memory in bytes.
   * - memory.percentage: number — percentage of memory used, rounded to the nearest integer.
   * - uptime: number — system uptime in seconds.
   *
   * Calculations are performed using Node's `os` module:
   * - used = total - free
   * - percentage = Math.round((used / total) * 100)
   *
   * Remarks:
   * - Values reflect the system state at the moment the method is invoked.
   * - If `total` is 0 (highly unlikely), the percentage calculation may produce NaN or Infinity; callers should handle this edge case if necessary.
   *
   * @returns {Interfaces.ISystemInfoResponse} A snapshot of memory statistics and system uptime.
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
   * Determine the aggregated health status from a set of dependency responses.
   *
   * This function inspects the `status` field of each dependency in the provided
   * record and returns an overall service health:
   * - Returns `'healthy'` when every dependency reports `'healthy'`.
   * - Returns `'unhealthy'` if any dependency reports `'unhealthy'`.
   * - Returns `'degraded'` otherwise (e.g. at least one non-healthy, non-unhealthy status).
   *
   * Precedence: an `'unhealthy'` status takes precedence over `'degraded'`.
   *
   * Note: if `dependencies` is empty, this implementation will return `'healthy'`
   * because there are no reported problems.
   *
   * @param dependencies - A record keyed by dependency name whose values are
   *   objects implementing Interfaces.IDependencyResponse (expected to have a
   *   `status` property with values like `'healthy' | 'degraded' | 'unhealthy'`).
   * @returns The overall status: `'healthy' | 'unhealthy' | 'degraded'`.
   *
   * @example
   * // { db: { status: 'healthy' }, cache: { status: 'healthy' } } -> 'healthy'
   * // { db: { status: 'degraded' }, cache: { status: 'healthy' } } -> 'degraded'
   * // { db: { status: 'unhealthy' }, cache: { status: 'healthy' } } -> 'unhealthy'
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
   * Handle a failed health check by logging the error and sending a 503 Service Unavailable
   * JSON response to the client.
   *
   * This method:
   * - Ensures a requestId is present (reads req.requestId if set, otherwise generates one).
   * - Logs the failure using this.logger.error with the check type, requestId, error message, and stack.
   * - Constructs a partial health response containing:
   *   - status: "unhealthy"
   *   - timestamp (ISO string from this.clock)
   *   - service and version from this.config
   *   - uptime in milliseconds (derived from process.uptime())
   *   - requestId
   * - Sends the constructed response with HTTP status 503.
   * - If an error occurs while building or sending the response, sends a minimal fallback 503 JSON
   *   payload containing a default version, zero uptime, and an "Health check system failure" error.
   *
   * Notes:
   * - This method is intended to be used inside an Express route/controller and mutates the response.
   * - It performs side effects (logging, potential UUID generation) and does not rethrow errors.
   *
   * @param req - Express request object; may contain a pre-populated `requestId` string.
   * @param res - Express response object used to send the 503 JSON payload.
   * @param error - The Error instance describing why the health check failed; its message and stack
   *   will be recorded in logs.
   * @param type - The health check type, typically 'basic' or 'deep', used to classify the log entry.
   *
   * @returns A promise that resolves when the response has been sent (Promise<void>).
   *
   * @example
   * // from an Express handler:
   * await this.handleHealthError(req, res, new Error('database unreachable'), 'deep');
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
