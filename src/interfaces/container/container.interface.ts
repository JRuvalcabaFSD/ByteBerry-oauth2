import { ServiceMap } from '@container';

/**
 * Represents the lifecycle of a dependency within a container.
 * - `'singleton'`: A single instance is shared and reused.
 * - `'transient'`: A new instance is created each time it is requested.
 */
export type Lifecycle = 'singleton' | 'transient';

/**
 * Dependency injection container interface for managing service registrations and resolutions.
 *
 * @remarks
 * This interface provides methods to register and resolve services using a type-safe approach
 * based on a ServiceMap. It supports three types of registrations:
 * - Transient: Creates a new instance every time the service is resolved
 * - Singleton: Creates a single instance that is reused across all resolutions
 * - Instance: Registers an existing instance
 *
 * @template ServiceMap - A mapping of service tokens to their corresponding types.
 *
 * @example
 * ```typescript
 * const container: IContainer = new Container();
 *
 * // Register a transient service
 * container.register('userService', (c) => new UserService(c.resolve('database')));
 *
 * // Register a singleton
 * container.registerSingleton('logger', (c) => new Logger());
 *
 * // Register an existing instance
 * container.registerInstance('config', configInstance);
 *
 * // Resolve a service
 * const userService = container.resolve('userService');
 * ```
 */

export interface IContainer {
	register<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void;
	registerSingleton<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void;
	registerInstance<K extends keyof ServiceMap>(token: K, instance: ServiceMap[K]): void;
	resolve<K extends keyof ServiceMap>(token: K): ServiceMap[K];
	isRegistered(token: keyof ServiceMap): boolean;
}
