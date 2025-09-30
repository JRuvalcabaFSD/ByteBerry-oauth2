import { IContainer, LifecycleType } from '@/interfaces';
import { CircularDependencyError, ContainerError, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

/**
 * Represents a service registration entry in the dependency injection container.
 *
 * @template T - The type of service being registered
 *
 * @property factory - A factory function that creates an instance of the service when called with the container
 * @property lifecycle - Defines the lifecycle management strategy for the service (e.g., singleton, transient)
 * @property instance - Optional cached instance of the service, used for lifecycle management
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ServiceRegistration<T = any> {
  factory: (container: IContainer) => T;
  lifecycle: LifecycleType;
  instance?: T;
}

/**
 * A dependency injection container that manages service registrations and resolution.
 *
 * The Container class provides functionality to register services with different lifecycles
 * (transient, singleton, or instance) and resolve them with their dependencies. It includes
 * circular dependency detection and proper error handling during service resolution.
 *
 * @example
 * ```typescript
 * const container = new Container();
 *
 * // Register a transient service
 * container.register(MyService, (c) => new MyService());
 *
 * // Register a singleton service
 * container.registerSingleton(DatabaseService, (c) => new DatabaseService());
 *
 * // Register an existing instance
 * container.registerInstance(ConfigService, new ConfigService());
 *
 * // Resolve a service
 * const service = container.resolve(MyService);
 * ```
 *
 * @throws {TokenAlreadyRegisteredError} When attempting to register a token that's already registered
 * @throws {TokenNotRegisteredError} When attempting to resolve an unregistered token
 * @throws {CircularDependencyError} When a circular dependency is detected during resolution
 * @throws {ContainerError} When service instantiation fails for any other reason
 */

export class Container implements IContainer {
  private readonly services = new Map<symbol, ServiceRegistration>();
  private readonly resolutionStack: symbol[] = [];

  /**
   * Registers a service with the container using a factory function.
   * @template T - The type of service being registered
   * @param {symbol} token - A unique symbol that identifies the service
   * @param {(container: IContainer) => T} factory - A factory function that creates an instance of the service when called with the container
   * @memberof Container
   */

  public register<T>(token: symbol, factory: (container: IContainer) => T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'transient' });
  }

  /**
   * Registers a singleton service with the container using a factory function.
   * @template T - The type of service being registered
   * @param {symbol} token - A unique symbol that identifies the service
   * @param {(container: IContainer) => T} factory - A factory function that creates an instance of the service when called with the container
   * @memberof Container
   */

  public registerSingleton<T>(token: symbol, factory: (container: IContainer) => T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'singleton' });
  }

  /**
   * Registers an existing instance with the container.
   * @template T
   * @param {symbol} token - A unique symbol that identifies the service
   * @param {T} instance - The existing instance to register
   * @memberof Container
   */

  public registerInstance<T>(token: symbol, instance: T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory: () => instance, lifecycle: 'singleton', instance });
  }

  /**
   * Resolves a service by its token, creating an instance if necessary.
   * @template T - The type of service being resolved
   * @param {symbol} token - A unique symbol that identifies the service
   * @return {*}  {T} - The resolved service instance
   * @memberof Container
   */

  public resolve<T>(token: symbol): T {
    const registration = this.services.get(token);

    if (!registration) throw new TokenNotRegisteredError(token);
    if (this.resolutionStack.includes(token)) throw new CircularDependencyError(this.resolutionStack, token);
    if (registration.lifecycle === 'singleton' && registration.instance !== undefined) return registration.instance as T;

    this.resolutionStack.push(token);

    try {
      const instance = registration.factory(this);
      if (registration.lifecycle === 'singleton') {
        registration.instance = instance;
      }
      return instance;
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        throw error;
      }

      throw new ContainerError(`Failed to resolve service '${token.description}': ${(error as Error).message}`, token);
    } finally {
      this.resolutionStack.pop();
    }
  }

  /**
   * Checks if a service is registered with the container.
   * @param {symbol} token - A unique symbol that identifies the service
   * @return {*}  {boolean} - True if the service is registered, false otherwise
   * @memberof Container
   */

  public isRegistered(token: symbol): boolean {
    return this.services.has(token);
  }
}
