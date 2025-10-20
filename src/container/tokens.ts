import { IClock, IConfig, ILogger, IUuid } from '@/interfaces';

/**
 * Identifies the built-in dependency-injection tokens used by the container.
 *
 * These string-literal tokens represent commonly-registered services:
 * - "Config": application configuration provider
 * - "Logger": logging implementation
 * - "Clock": clock/time provider (useful for deterministic testing)
 * - "Uuid": UUID/ID generator
 *
 * Use these tokens when binding or resolving services from the DI container.
 *
 * @public
 */

export type Token = 'Config' | 'Logger' | 'Clock' | 'Uuid';

/**
 * Represents the set of services registered in the dependency-injection container.
 *
 * Each property corresponds to a named service exposed by the container and
 * documents the interface expected for that service.
 *
 * @property Config - Provides application configuration values (IConfig).
 * @property Logger - Structured logging facility used for diagnostics and tracing (ILogger).
 * @property Clock - Abstraction over time access, enabling deterministic time operations and testing (IClock).
 * @property Uuid - UUID generation and utilities for creating unique identifiers (IUuid).
 */

export interface ServiceMap {
  Config: IConfig;
  Logger: ILogger;
  Clock: IClock;
  Uuid: IUuid;
}

/**
 * Identifies the set of service identifiers that are considered critical for the application.
 *
 * These tokens represent services that must be available for correct startup and runtime
 * behavior (for example: configuration, time source, and UUID generation). They are used
 * for initialization ordering, health checks, and to enforce required dependencies.
 *
 * @remarks
 * Treat this list as read-only and stable — changing or removing entries can affect
 * initialization, monitoring, and other lifecycle logic that assumes these services exist.
 *
 * @readonly
 * @example
 * // Check whether a given service is considered critical
 * const isCritical = criticalServices.includes('Config');
 */

export const criticalServices = ['Config', 'Clock', 'Uuid', 'Logger'];
