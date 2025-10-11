import { Request, Response } from 'express';

import { NodeEnv } from '@/interfaces';

/**
 * Represents the response structure for a dependency health check.
 *
 * @interface DependencyResponse
 * @property {('healthy' | 'unhealthy')} status - The health status of the dependency
 * @property {string} message - A descriptive message about the dependency's current state
 * @property {number} [responseTime] - Optional response time in milliseconds for the health check
 */

export type DependencyResponse = { status: 'healthy' | 'unhealthy'; message: string; responseTime?: number };

/**
 * Response object containing system health information.
 *
 * @interface SystemInfoResponse
 * @property {Object} memory - Memory usage statistics
 * @property {number} memory.used - Amount of memory currently in use (in bytes)
 * @property {number} memory.free - Amount of available free memory (in bytes)
 * @property {number} memory.total - Total system memory (in bytes)
 * @property {number} memory.percentage - Memory usage as a percentage (0-100)
 * @property {number} uptime - System uptime in seconds since last restart
 */

export type SystemInfoResponse = { memory: { used: number; free: number; total: number; percentage: number }; uptime: number };

/**
 * Interface defining the structure of a health check response.
 *
 * @interface IHealthResponse
 * @description Represents the health status of a service including metadata about its current state,
 * environment, and operational metrics.
 *
 * @property {('healthy' | 'unhealthy' | 'degraded')} status - The current health status of the service
 * @property {string} timestamp - ISO 8601 timestamp when the health check was performed
 * @property {string} service - Name or identifier of the service being checked
 * @property {string} version - Current version of the service
 * @property {number} uptime - Service uptime in seconds since last restart
 * @property {string} requestId - Unique identifier for the health check request
 * @property {NodeEnv} environment - Current environment (development, production, etc.)
 *
 * @example
 * ```typescript
 * const healthResponse: IHealthResponse = {
 *   status: 'healthy',
 *   timestamp: '2023-12-07T10:30:00.000Z',
 *   service: 'oauth2-service',
 *   version: '1.0.0',
 *   uptime: 3600,
 *   requestId: 'req-123-456',
 *   environment: 'production'
 * };
 * ```
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
 * Extended health response interface that provides comprehensive system health information.
 *
 * @interface IDeepHealthResponse
 * @extends IHealthResponse
 *
 * @description This interface extends the basic health response to include detailed information
 * about system dependencies and system information, providing a complete health check overview.
 *
 * @property {Record<string, DependencyResponse>} dependencies - A record of dependency health statuses,
 * where each key represents a dependency name and the value contains its health response details.
 *
 * @property {SystemInfoResponse} system - Detailed system information including runtime metrics,
 * version details, and other system-level health indicators.
 *
 * @example
 * ```typescript
 * const deepHealth: IDeepHealthResponse = {
 *   // ... IHealthResponse properties
 *   dependencies: {
 *     database: { status: 'healthy', responseTime: 50 },
 *     redis: { status: 'healthy', responseTime: 10 }
 *   },
 *   system: {
 *     uptime: 3600,
 *     memory: { used: 512, total: 1024 },
 *     version: '1.0.0'
 *   }
 * };
 * ```
 */

export interface IDeepHealthResponse extends IHealthResponse {
  dependencies: Record<string, DependencyResponse>;
  system: SystemInfoResponse;
}

/**
 * Interface for health check controller operations.
 *
 * Defines the contract for health monitoring endpoints that provide
 * basic health status and deep health diagnostics for the application.
 */

export interface IHealthController {
  /**
   * Handles a basic health check request, returning the overall health status of the service.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @return {*}  {Promise<void>} - Promise resolving when the response is sent
   * @memberof IHealthController
   */

  getHealth(req: Request, res: Response): Promise<void>;

  /**
   * Handles a deep health check request, returning detailed diagnostics including
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @return {*}  {Promise<void>} - Promise resolving when the response is sent
   * @memberof IHealthController
   */

  getDeepHealth(req: Request, res: Response): Promise<void>;
}
