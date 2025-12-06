/* eslint-disable @typescript-eslint/no-explicit-any */
import * as errors from '@shared';
import { getErrMsg } from '@shared';
import { IContainer, Lifecycle } from '@interfaces';
import { ServiceMap, Token } from './tokens.js';

/**
 * Represents a service registration entry in the dependency injection container.
 *
 * @template K - The service key type that extends the keys of ServiceMap
 *
 * @property {function} factory - A factory function that creates an instance of the service.
 *                                 Receives the container as a parameter and returns the service instance.
 * @property {Lifecycle} lifecycle - Defines the lifecycle strategy for the service (e.g., singleton, transient).
 * @property {ServiceMap[K]} [instance] - Optional cached instance of the service, typically used for singleton lifecycle.
 */

interface ServiceRegistration<K extends keyof ServiceMap = any> {
	factory: (container: IContainer) => ServiceMap[K];
	lifecycle: Lifecycle;
	instance?: ServiceMap[K];
}

/**
 * A dependency injection container that manages service registration and resolution.
 *
 * The Container class provides methods to register services with different lifecycles
 * (transient, singleton, or instance) and resolves them with circular dependency detection.
 *
 * @remarks
 * The container supports three registration types:
 * - Transient: A new instance is created each time the service is resolved
 * - Singleton: A single instance is created and reused for all resolutions
 * - Instance: A pre-existing instance is registered and returned on resolution
 *
 * @example
 * ```typescript
 * const container = new Container();
 *
 * // Register a transient service
 * container.register('logger', (c) => new Logger());
 *
 * // Register a singleton service
 * container.registerSingleton('database', (c) => new Database());
 *
 * // Register an existing instance
 * const config = new Config();
 * container.registerInstance('config', config);
 *
 * // Resolve a service
 * const logger = container.resolve('logger');
 * ```
 *
 * @throws {TokenAlreadyRegisteredError} When attempting to register a token that is already registered
 * @throws {TokenNotRegisteredError} When attempting to resolve a token that hasn't been registered
 * @throws {CircularDependencyError} When a circular dependency is detected during resolution
 * @throws {ContainerError} When service resolution fails for any other reason
 */

export class Container implements IContainer {
	private readonly services = new Map<Token, ServiceRegistration<Token>>();
	private readonly resolutionStack: Token[] = [];

	/**
	 * Registers a service factory with the container.
	 *
	 * @template K - The service token type, must be a key of ServiceMap
	 * @param {K} token - The unique identifier for the service to register
	 * @param {(container: IContainer) => ServiceMap[K]} factory - A factory function that creates the service instance
	 * @throws {TokenAlreadyRegisteredError} Throws if a service with the same token is already registered
	 * @returns {void}
	 *
	 * @remarks
	 * The registered service will have a 'transient' lifecycle by default, meaning a new instance
	 * is created each time the service is resolved from the container.
	 */

	public register<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void {
		if (this.services.has(token)) throw new errors.TokenAlreadyRegisteredError(token);
		this.services.set(token, { factory, lifecycle: 'transient' });
	}

	/**
	 * Registers a singleton service in the container.
	 *
	 * A singleton service is instantiated only once and the same instance is returned
	 * on every subsequent resolution.
	 *
	 * @template K - The service token type that must be a key of ServiceMap
	 * @param token - The unique identifier for the service
	 * @param factory - A factory function that creates the service instance, receiving the container as a parameter
	 * @throws {TokenAlreadyRegisteredError} When a service with the same token is already registered
	 *
	 * @example
	 * ```typescript
	 * container.registerSingleton('logger', (container) => new Logger());
	 * ```
	 */

	public registerSingleton<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void {
		if (this.services.has(token)) throw new errors.TokenAlreadyRegisteredError(token);
		this.services.set(token, { factory, lifecycle: 'singleton' });
	}

	/**
	 * Registers a pre-existing instance as a singleton service in the container.
	 *
	 * This method allows you to register an already instantiated object as a service,
	 * which will be returned whenever the service is resolved. The instance is stored
	 * as a singleton and will always return the same object reference.
	 *
	 * @template K - The service token type, constrained to keys of ServiceMap
	 * @param token - The unique identifier used to register and retrieve the service
	 * @param instance - The pre-instantiated service object to register
	 * @throws {TokenAlreadyRegisteredError} When a service with the same token is already registered
	 * @returns {void}
	 *
	 * @example
	 * ```typescript
	 * const logger = new Logger();
	 * container.registerInstance('logger', logger);
	 * ```
	 */

	public registerInstance<K extends keyof ServiceMap>(token: K, instance: ServiceMap[K]): void {
		if (this.services.has(token)) throw new errors.TokenAlreadyRegisteredError(token);
		this.services.set(token, { factory: () => instance, lifecycle: 'singleton', instance });
	}

	/**
	 * Resolves and returns an instance of the service registered with the given token.
	 *
	 * @template K - The service token type that extends the keys of ServiceMap
	 * @param {K} token - The unique identifier for the service to resolve
	 * @returns {ServiceMap[K]} The resolved service instance
	 *
	 * @throws {TokenNotRegisteredError} When the token is not registered in the container
	 * @throws {CircularDependencyError} When a circular dependency is detected during resolution
	 * @throws {ContainerError} When the service factory fails to create an instance
	 *
	 * @remarks
	 * - For singleton services, returns the cached instance if it exists
	 * - Tracks resolution stack to detect circular dependencies
	 * - Caches singleton instances after first resolution
	 * - Transient services are created on each resolution
	 */

	public resolve<K extends keyof ServiceMap>(token: K): ServiceMap[K] {
		const registration = this.services.get(token);

		if (!registration) throw new errors.TokenNotRegisteredError(token);
		if (this.resolutionStack.includes(token)) throw new errors.CircularDependencyError(this.resolutionStack, token);
		if (registration.lifecycle === 'singleton' && registration.instance !== undefined) return registration.instance as ServiceMap[K];

		this.resolutionStack.push(token);

		try {
			const instance = registration.factory(this);
			if (registration.lifecycle === 'singleton') {
				registration.instance = instance;
			}

			return instance as ServiceMap[K];
		} catch (error) {
			if (error instanceof errors.ConfigError) throw error;
			if (error instanceof errors.CircularDependencyError) throw error;
			throw new errors.ContainerError(`Failed to resolve service '${token}': ${getErrMsg(error)}`, token);
		} finally {
			this.resolutionStack.pop();
		}
	}

	/**
	 * Checks if a service is registered in the container.
	 *
	 * @param token - The service identifier to check for registration
	 * @returns `true` if the service is registered, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * if (container.isRegistered('userService')) {
	 *   // Service is available
	 * }
	 * ```
	 */

	public isRegistered(token: keyof ServiceMap): boolean {
		return this.services.has(token);
	}
}
