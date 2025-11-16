import { Request, Response } from 'express';

import { NodeEnv } from '@/interfaces';

/**
 * Represents the response object for a dependency health check.
 *
 * @property {('healthy' | 'unhealthy')} status - The health status of the dependency.
 * @property {string} message - A descriptive message about the dependency's health status.
 * @property {number} [responseTime] - Optional response time of the dependency check in milliseconds.
 */

export type IDependencyResponse = { status: 'healthy' | 'unhealthy'; message: string; responseTime?: number };
/**
 * Represents the system information response containing memory usage and uptime details.
 *
 * @property memory - Memory usage statistics
 * @property memory.used - Amount of memory currently in use (in bytes)
 * @property memory.free - Amount of available free memory (in bytes)
 * @property memory.total - Total system memory capacity (in bytes)
 * @property memory.percentage - Percentage of memory currently in use (0-100)
 * @property uptime - System uptime duration (in seconds)
 */

export type ISystemInfoResponse = { memory: { used: number; free: number; total: number; percentage: number }; uptime: number };

/**
 * Represents the health check response for the service.
 *
 * @interface IHealthResponse
 * @property {('healthy' | 'unhealthy' | 'degraded')} status - The current health status of the service
 * @property {string} timestamp - ISO 8601 timestamp when the health check was performed
 * @property {string} service - The name of the service being monitored
 * @property {string} version - The current version of the service
 * @property {number} uptime - The uptime of the service in seconds
 * @property {string} requestId - Unique identifier for the health check request
 * @property {NodeEnv} environment - The environment where the service is running (e.g., development, production)
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
 * Represents a detailed health check response with comprehensive system information.
 *
 * @extends IHealthResponse
 *
 * @property {Record<string, unknown>} dependencies - A map of dependency names to their health status or metadata.
 * @property {ISystemInfoResponse} system - System information including runtime and environment details.
 *
 * @remarks
 * This interface is typically used for deep health check endpoints that provide
 * detailed information about the application's dependencies and system state.
 */

export interface IDeepHealthResponse extends IHealthResponse {
  dependencies: Record<string, unknown>;
  system: ISystemInfoResponse;
}

/**
 * Interface for health check controller operations.
 *
 * @interface IHealthService
 * @description Defines the contract for health check endpoints that monitor the application's status.
 * Provides both basic and deep health check capabilities for system diagnostics.
 */

export interface IHealthService {
  /**
   * Handles the basic health check request.
   *
   * @param {Request} req - The incoming request object
   * @param {Response} res - The outgoing response object
   * @return {*}  {Promise<void>} - A promise that resolves when the response is sent
   * @memberof IHealthService
   */

  getHealth(req: Request, res: Response): Promise<void>;

  /**
   * Handles the deep health check request.
   *
   * @param {Request} req - The incoming request object
   * @param {Response} res - The outgoing response object
   * @return {*}  {Promise<void>} - A promise that resolves when the response is sent
   * @memberof IHealthService
   */

  getDeepHealth(req: Request, res: Response): Promise<void>;

  /**
   * Performs a health check of the service.
   *
   * @template T - The type of health check ('simple' or 'deep')
   * @param {T} type - The type of health check to perform
   * @return {*}  {Promise<T extends 'deep' ? IDeepHealthResponse : IHealthResponse>} - A promise that resolves to the health check response
   * @memberof IHealthService
   */

  checkHealth<T extends 'simple' | 'deep'>(
    type: T,
    requestId: string,
    services: string[]
  ): Promise<T extends 'deep' ? IDeepHealthResponse : IHealthResponse>;
}
