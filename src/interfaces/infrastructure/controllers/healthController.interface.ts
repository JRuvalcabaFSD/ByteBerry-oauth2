import { Request, Response } from 'express';

import { NodeEnv } from '@/interfaces';

/**
 * Represents the response structure for a dependency health check.
 *
 * @interface IDependencyResponse
 * @property {('healthy' | 'unhealthy')} status - The health status of the dependency
 * @property {string} message - A descriptive message about the dependency's current state
 * @property {number} [responseTime] - Optional response time in milliseconds for the health check
 */

export type IDependencyResponse = { status: 'healthy' | 'unhealthy'; message: string; responseTime?: number };

/**
 * Information about the current system state returned by a health check.
 *
 * @remarks
 * - All memory values are expressed in bytes.
 * - `memory.percentage` is a number in the range 0–100 representing the percent of total memory that is used.
 * - `uptime` is the system uptime expressed in seconds.
 *
 * @property memory.used - Number of bytes currently in use.
 * @property memory.free - Number of bytes currently available.
 * @property memory.total - Total number of bytes of physical memory.
 * @property memory.percentage - Percentage of total memory that is used (0–100).
 * @property uptime - System uptime in seconds.
 *
 * @example
 * // Example value
 * // {
 * //   memory: { used: 512000000, free: 1536000000, total: 2048000000, percentage: 25 },
 * //   uptime: 3600
 * // }
 */

export type ISystemInfoResponse = { memory: { used: number; free: number; total: number; percentage: number }; uptime: number };

/**
 * Describes the health-check response returned by a service.
 *
 * Provides a concise snapshot of a service's runtime state and metadata
 * useful for monitoring, diagnostics, and tracing.
 *
 * @remarks
 * - status: Indicates overall health — one of 'healthy', 'unhealthy', or 'degraded'.
 * - timestamp: ISO 8601 timestamp (UTC) when the health snapshot was generated.
 * - service: Logical name of the reporting service (e.g. "auth-service").
 * - uptime: Service uptime in seconds (monotonic since process start).
 * - requestId: Correlation identifier for the request/response used for tracing.
 * - environment: Node runtime environment (see NodeEnv type, e.g. 'development' | 'production' | 'test').
 *
 * @example
 * // Example health response
 * {
 *   status: 'healthy',
 *   timestamp: '2025-10-21T12:34:56.789Z',
 *   service: 'oauth2',
 *   uptime: 86400,
 *   requestId: 'req-1234567890',
 *   environment: 'production'
 * }
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

/**
 * Extended health response that builds on the base IHealthResponse by including
 * detailed information about service dependencies and the host system.
 *
 * This interface is useful for endpoints that need to return not just an overall
 * health status but also per-dependency diagnostics and system-level metadata.
 *
 * @extends IHealthResponse
 *
 * @property dependencies - A record mapping dependency names to their health details or metadata.
 *                           The values are purposely typed as unknown to allow different shapes
 *                           of dependency information (status, latency, version, etc.).
 * @property system - ISystemInfoResponse containing information about the environment where
 *                     the service is running (for example OS, uptime, memory, CPU, versions).
 */

export interface IDeepHealthResponse extends IHealthResponse {
  dependencies: Record<string, unknown>;
  system: ISystemInfoResponse;
}

/**
 * Interface for HTTP health check controllers.
 *
 * Implementations should expose endpoints to report the service's current
 * operational status. Methods are asynchronous and are expected to send an
 * HTTP response via the provided Express Request and Response objects.
 *
 * @remarks
 * - getHealth: a lightweight readiness/liveness probe intended to return
 *   a quick summary of the application's health (typically used by load
 *   balancers or container orchestrators).
 * - getDeepHealth: a deeper diagnostic check that may query databases,
 *   caches, message brokers, or external dependencies and return an
 *   aggregated health result.
 *
 * @interface IHealthController
 */

export interface IHealthController {
  /**
   * Handles a basic health check request, returning a summary of the service's
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof IHealthController
   */

  getHealth(req: Request, res: Response): Promise<void>;

  /**
   * Handles a deep health check request, returning detailed information about the service's
   * dependencies and system status.
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof IHealthController
   */

  getDeepHealth(req: Request, res: Response): Promise<void>;
}
