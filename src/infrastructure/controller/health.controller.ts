import os from 'os';
import { Request, Response } from 'express';

import { criticalServices } from '@/container';
import {
  DependencyResponse,
  IClock,
  IConfig,
  IContainer,
  IDeepHealthResponse,
  IHealthController,
  IHealthResponse,
  ILogger,
  IUuid,
  SystemInfoResponse,
} from '@/interfaces';

/**
 * Provides HTTP health check endpoints for the service, including a fast "basic" liveness check
 * and a more expensive "deep" readiness check that inspects dependencies and host metrics.
 *
 * The controller:
 * - Captures a monotonic start time to compute process uptime.
 * - Correlates requests via a requestId (taken from the request or generated).
 * - Emits structured logs for both successful and failed health checks.
 * - Produces stable timestamps using a clock abstraction.
 * - Reads service metadata (name, version, environment) from configuration.
 * - Optionally inspects the dependency injection container to verify critical services.
 *
 * Responses:
 * - Basic health: 200 when healthy; 503 on failure.
 * - Deep health: 200 when healthy or degraded; 503 when unhealthy.
 * - All responses include a requestId and timestamp; error responses return a partial payload when necessary.
 *
 * Threading and performance:
 * - Designed to be non-blocking; dependency checks are bounded to DI lookups and do not perform I/O.
 * - System metrics are read from the OS and are inexpensive.
 *
 * Assumptions:
 * - `req.requestId` may be attached by upstream middleware; otherwise a UUID is generated.
 * - A `criticalServices` registry is available in scope to indicate which container tokens are required.
 *
 * @remarks
 * This controller is intended for operational monitoring. It minimizes external calls and
 * avoids throwing—responses are always written with an appropriate status code. In case of
 * cascading failures (e.g., clock/logger issues), it falls back to safe defaults.
 *
 * @public
 * @implements IHealthController
 */

export class HealthController implements IHealthController {
  private readonly startTime: Date;

  /**
   * Creates a HealthController.
   *
   * @param container The dependency injection container used to verify critical services.
   * @param config Provides service metadata (service name, version, environment).
   * @param logger Structured logger used to record health check outcomes and errors.
   * @param uuid UUID generator used to ensure each response includes a requestId.
   * @param clock Time provider used for timestamps, ISO strings, and uptime computation.
   *
   * @remarks
   * Captures the process start time using the provided clock to compute uptime consistently.
   */

  constructor(
    private readonly container: IContainer,
    private readonly config: IConfig,
    private readonly logger: ILogger,
    private readonly uuid: IUuid,
    private readonly clock: IClock
  ) {
    this.startTime = this.clock.now();
  }

  /**
   * Handles the basic health (liveness) check.
   *
   * Returns immediate service status with metadata and process uptime.
   * Intended for lightweight probes (e.g., k8s liveness).
   *
   * @param req Incoming HTTP request (may contain a requestId for correlation).
   * @param res HTTP response used to write the JSON health payload.
   * @returns A promise that resolves after the response is written.
   *
   * @httpstatus 200 Healthy
   * @httpstatus 503 Unhealthy (fallback error response)
   *
   * @remarks
   * - Includes: status, timestamp, service, version, uptime, requestId, environment.
   * - Logs a structured info record on success; logs an error with details on failure.
   * - Never throws; always writes a response.
   */

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || this.uuid.generate();
      const uptime = this.clock.timestamp() - this.startTime.getTime();

      const response: IHealthResponse = {
        status: 'healthy',
        timestamp: this.clock.isoString(),
        service: this.config.serviceName,
        version: this.config.version,
        uptime,
        requestId,
        environment: this.config.nodeEnv,
      };

      this.logger.info('Health check completed', { requestId, status: response.status, uptime });
      res.status(200).json(response);
    } catch (error) {
      const requestId = req.requestId || this.uuid.generate();

      this.logger.error('Health check failed', { error: (error as Error).message, requestId });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(), // Usar fallback en lugar del clock que falló
        service: this.config.serviceName,
        requestId,
        error: (error as Error).message,
      });
    }
  };

  /**
   * Checks the availability of critical dependencies by consulting the DI container.
   *
   * For each entry in `criticalServices`, it:
   * - Confirms registration in the container.
   * - Attempts resolution from the container.
   * - Records a DependencyResponse with status, message, and responseTime (ms).
   *
   * @returns A map keyed by dependency name with per-dependency health details.
   *
   * @remarks
   * No network calls are performed; this is a structural check. If a service is not registered
   * or resolution fails, the dependency is marked unhealthy.
   *
   * @internal
   */

  public getDeepHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || this.uuid.generate();
      const startTime = this.clock.timestamp();

      const dependencies = await this.checkDependencies();
      const systemInfo = this.getSystemInfo();
      const overallStatus = this.determineOverallStatus(dependencies);

      const deepHealthResponse: IDeepHealthResponse = {
        status: overallStatus,
        timestamp: this.clock.isoString(),
        service: this.config.serviceName,
        version: this.config.version,
        uptime: this.clock.timestamp() - this.startTime.getTime(),
        requestId,
        environment: this.config.nodeEnv,
        dependencies,
        system: systemInfo,
      };

      this.logger.info('Deep health check completed', {
        requestId,
        status: overallStatus,
        responseTime: this.clock.timestamp() - startTime,
        dependencyCount: Object.keys(dependencies).length,
      });
      const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
      res.status(statusCode).json(deepHealthResponse);
    } catch (error) {
      await this.handleHealthError(req, res, error as Error, 'deep');
    }
  };

  /**
   * Handles the deep health (readiness) check.
   *
   * Performs dependency verification and captures host/system metrics. Aggregates
   * dependency health into an overall status:
   * - healthy: all dependencies healthy
   * - unhealthy: any dependency unhealthy
   * - degraded: otherwise (e.g., partial warnings)
   *
   * @param req Incoming HTTP request (may contain a requestId for correlation).
   * @param res HTTP response used to write the JSON deep health payload.
   * @returns A promise that resolves after the response is written.
   *
   * @httpstatus 200 Healthy
   * @httpstatus 200 Degraded
   * @httpstatus 503 Unhealthy
   *
   * @remarks
   * The payload includes: status, timestamp, service, version, uptime, requestId, environment,
   * a per-dependency map with status and responseTime, and system metrics (memory and uptime).
   * Logs include the measured response time for the deep check and dependency count.
   */

  private async checkDependencies(): Promise<Record<string, DependencyResponse>> {
    const dependencies: Record<string, DependencyResponse> = {};

    for (const service of criticalServices) {
      const startTime = this.clock.timestamp();

      try {
        if (!this.container.isRegistered(service.token)) {
          dependencies[service.name] = {
            status: 'unhealthy',
            message: `${service.name} service is not registered in container`,
            responseTime: this.clock.timestamp() - startTime,
          };
          continue;
        }

        const resolvedService = this.container.resolve(service.token);

        if (!resolvedService) {
          dependencies[service.name] = {
            status: 'unhealthy',
            message: `${service.name} service resolved to null/undefined`,
            responseTime: this.clock.timestamp() - startTime,
          };
          continue;
        }

        dependencies[service.name] = {
          status: 'healthy',
          message: `${service.name} service is available and operational`,
          responseTime: this.clock.timestamp() - startTime,
        };
      } catch (error) {
        dependencies[service.name] = {
          status: 'unhealthy',
          message: `${service.name} service check failed: ${(error as Error).message}`,
          responseTime: this.clock.timestamp() - startTime,
        };
      }
    }
    return dependencies;
  }

  /**
   * Collects host/system information from the operating system.
   *
   * @returns An object containing:
   * - memory.used: bytes used
   * - memory.free: bytes free
   * - memory.total: total bytes
   * - memory.percentage: integer percent of used memory
   * - uptime: OS uptime in seconds
   *
   * @remarks
   * Intended to provide context for operational dashboards. This call is synchronous and inexpensive.
   *
   * @internal
   */

  private getSystemInfo(): SystemInfoResponse {
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
   * Computes the overall service status from per-dependency results.
   *
   * @param dependencies A map of dependencies to their health status.
   * @returns 'healthy' if all are healthy; 'unhealthy' if any are unhealthy; otherwise 'degraded'.
   *
   * @remarks
   * This function is purely deterministic and side-effect free.
   *
   * @internal
   */

  private determineOverallStatus(dependencies: Record<string, DependencyResponse>): 'healthy' | 'unhealthy' | 'degraded' {
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
   * Handles unexpected errors during health checks by logging and returning a safe 503 payload.
   *
   * @param req The original HTTP request (used for correlation).
   * @param res The HTTP response to write the error payload to.
   * @param error The caught error.
   * @param type Indicates the health check type ('basic' | 'deep') for logging context.
   * @returns A promise that resolves after the error response is written.
   *
   * @httpstatus 503 Unhealthy
   *
   * @remarks
   * Attempts to use the clock and config to include stable fields. On catastrophic failure (e.g.,
   * logging/clock issues), falls back to minimal static values to ensure a response is still returned.
   *
   * @internal
   */

  private async handleHealthError(req: Request, res: Response, error: Error, type: 'basic' | 'deep'): Promise<void> {
    try {
      const requestId = req.requestId || this.uuid.generate();

      this.logger.error(`${type} health check failed`, {
        requestId,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse: Partial<IHealthResponse> = {
        status: 'unhealthy',
        timestamp: this.clock.isoString(),
        service: this.config.serviceName,
        version: this.config.version,
        uptime: this.clock.timestamp() - this.startTime.getTime(),
        requestId,
      };

      res.status(503).json(errorResponse);
    } catch (_) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: this.config.serviceName,
        version: '0.0.0',
        uptime: 0,
        error: 'Health check system failure',
      });
    }
  }
}
