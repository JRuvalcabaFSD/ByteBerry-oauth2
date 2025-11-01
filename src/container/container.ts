import { ServiceMap, Token } from '@/container';
import { IContainer, lifecycle } from '@/interfaces';
import { CircularDependencyError, ContainerError, getErrMsg, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

/**
 * Represents a service registration in the dependency injection container.
 *
 * @template K - The key type that extends the keys of ServiceMap, defaults to any key from ServiceMap
 *
 * @property {function(IContainer): ServiceMap<K>} factory - A factory function that creates an instance of the service.
 *   The factory receives the container instance as a parameter and returns the service instance.
 * @property {lifecycle} lifecycle - Defines the lifecycle behavior of the service (e.g., singleton, transient).
 * @property {ServiceMap<K>} [instance] - Optional cached instance of the service.
 *   Typically used for singleton services to store the created instance.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ServiceRegistration<K extends keyof ServiceMap = any> {
  factory: (container: IContainer) => ServiceMap[K];
  lifecycle: lifecycle;
  instance?: ServiceMap[K];
}

/**
 * A dependency injection container that manages service registration and resolution.
 *
 * @remarks
 * The Container class implements the Inversion of Control (IoC) pattern, allowing services
 * to be registered with different lifecycles (transient, singleton, or instance) and resolved
 * with automatic dependency injection. It includes circular dependency detection and error handling.
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
 * container.registerInstance('config', { apiKey: '123' });
 *
 * // Resolve a service
 * const logger = container.resolve('logger');
 * ```
 *
 * @throws {TokenAlreadyRegisteredError} When attempting to register a token that already exists
 * @throws {TokenNotRegisteredError} When attempting to resolve an unregistered token
 * @throws {CircularDependencyError} When a circular dependency is detected during resolution
 * @throws {ContainerError} When service resolution fails for other reasons
 */

export class Container implements IContainer {
  private readonly services = new Map<Token, ServiceRegistration<Token>>();
  private readonly resolutionStack: Token[] = [];

  /**
   * Registers a service factory in the container with a transient lifecycle.
   *
   * @template K - The service token type, constrained to keys of ServiceMap
   * @param {K} token - The unique identifier for the service to register
   * @param {function(IContainer): ServiceMap<K>} factory - A factory function that creates an instance of the service
   * @throws {TokenAlreadyRegisteredError} Throws if a service with the same token is already registered
   * @returns {void}
   *
   * @example
   * ```typescript
   * container.register('userService', (container) => new UserService());
   * ```
   */

  public register<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'transient' });
  }

  /**
   * Registers a singleton service in the container.
   *
   * A singleton service is instantiated only once and the same instance is returned
   * for all subsequent resolutions of the same token.
   *
   * @template K - The service token type, constrained to keys of ServiceMap
   * @param token - The unique identifier for the service to be registered
   * @param {function(IContainer): ServiceMap<K>} factory - A factory function that creates the service instance, receiving the container as parameter
   * @throws {TokenAlreadyRegisteredError} When the token is already registered in the container
   * @returns {void}
   *
   * @example
   * ```typescript
   * container.registerSingleton('logger', (container) => new Logger());
   * ```
   */
  public registerSingleton<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'singleton' });
  }

  /**
   * Registers a pre-existing instance in the container as a singleton service.
   *
   * This method allows you to register an already instantiated object with the container,
   * making it available for dependency injection. The instance will be stored and returned
   * whenever the token is resolved.
   *
   * @template K - A key type that extends the keys of ServiceMap
   * @param token - The unique identifier token used to register and later resolve the service
   * @param instance - The pre-existing instance to register in the container
   * @throws {TokenAlreadyRegisteredError} When a service with the same token is already registered
   * @returns {void}
   *
   * @example
   * ```typescript
   * const logger = new Logger();
   * container.registerInstance('Logger', logger);
   * ```
   */

  public registerInstance<K extends keyof ServiceMap>(token: K, instance: ServiceMap[K]): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory: () => instance, lifecycle: 'singleton', instance });
  }

  /**
   * Resolves and returns an instance of a service registered with the given token.
   *
   * @template K - The service token type extending keyof ServiceMap
   * @param {K} token - The unique identifier for the service to resolve
   * @returns {ServiceMap<K>} The resolved service instance
   *
   * @throws {TokenNotRegisteredError} When the token is not registered in the container
   * @throws {CircularDependencyError} When a circular dependency is detected during resolution
   * @throws {ContainerError} When the service factory fails to create an instance
   *
   * @remarks
   * - For singleton services, returns the cached instance if available
   * - Tracks resolution stack to detect circular dependencies
   * - Caches singleton instances after first resolution
   * - Cleans up resolution stack in finally block to maintain consistency
   */

  public resolve<K extends keyof ServiceMap>(token: K): ServiceMap[K] {
    const registration = this.services.get(token);

    if (!registration) throw new TokenNotRegisteredError(token);
    if (this.resolutionStack.includes(token)) throw new CircularDependencyError(this.resolutionStack, token);
    if (registration.lifecycle === 'singleton' && registration.instance !== undefined) return registration.instance as ServiceMap[K];

    this.resolutionStack.push(token);

    try {
      const instance = registration.factory(this);
      if (registration.lifecycle === 'singleton') {
        registration.instance = instance;
      }

      return instance as ServiceMap[K];
    } catch (error) {
      if (error instanceof CircularDependencyError) throw error;
      throw new ContainerError(`Failed to resolve service '${token}': ${getErrMsg(error)}`, token);
    } finally {
      {
        this.resolutionStack.pop();
      }
    }
  }

  /**
   * Checks if a service is registered in the container.
   *
   * @param token - The service identifier token to check for registration
   * @returns `true` if the service is registered, `false` otherwise
   *
   * @example
   * ```typescript
   * if (container.isRegistered('myService')) {
   *   // Service is available
   * }
   * ```
   */

  public isRegistered(token: keyof ServiceMap): boolean {
    return this.services.has(token);
  }
}
