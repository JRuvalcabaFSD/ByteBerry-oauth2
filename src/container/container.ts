/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceMap, Token } from '@/container/tokens';
import { IContainer, lifecycle } from '@/interfaces';
import { CircularDependencyError, ContainerError, getErrorMessage, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

/**
 * Describes a service registered in the dependency injection container.
 *
 * @template T - The type of value produced by the registration's factory.
 *
 * @remarks
 * A ServiceRegistration holds the factory function used to create the service,
 * the lifecycle that controls how and when instances are created/reused, and an
 * optional cached instance that is populated when the lifecycle permits reuse
 * (for example, for singletons).
 *
 * @property factory - A function that receives the container (IContainer) and returns an instance of T.
 * @property lifecycle - The lifecycle policy for the registration (controls reuse, disposal, etc.).
 * @property instance - When present, holds the previously created instance for reuse according to the lifecycle.
 */

interface ServiceRegistration<T = any> {
  factory: (container: IContainer) => T;
  lifecycle: lifecycle;
  instance?: T;
}

/**
 * Dependency injection container that manages service registrations and resolutions by Token.
 *
 * The container supports three registration strategies:
 * - Transient (register): a factory is invoked on every resolve.
 * - Singleton (registerSingleton): a factory is invoked once and the resulting instance is cached.
 * - Instance (registerInstance): an already-created instance is stored and returned for every resolve.
 *
 * The container tracks an internal resolution stack to detect circular dependencies during resolution.
 * If a token is encountered twice while resolving dependencies, a CircularDependencyError is thrown.
 *
 * Behavior details:
 * - register(token, factory): registers a transient factory for the given token. Throws TokenAlreadyRegisteredError
 *   if the token is already registered.
 * - registerSingleton(token, factory): registers a singleton factory. The factory is invoked at first resolution
 *   and the instance is cached for subsequent resolves. Throws TokenAlreadyRegisteredError if the token is already registered.
 * - registerInstance(token, instance): registers an existing instance and treats it as a singleton. Throws
 *   TokenAlreadyRegisteredError if the token is already registered.
 * - resolve(token): resolves the token to an instance according to its lifecycle. Throws TokenNotRegisteredError if
 *   the token is not registered. Detects and throws CircularDependencyError for circular dependency chains. If a
 *   factory throws, the error is wrapped in a ContainerError that includes the token and the original message;
 *   CircularDependencyError is propagated unchanged.
 * - isRegistered(token): returns true when the token has a registration in the container.
 *
 * Notes:
 * - Registrations are keyed by Token and should align with the project's ServiceMap/IContainer typings.
 * - registerInstance uses the provided instance directly and marks the registration as singleton.
 *
 * @template TToken - The union of valid Token keys (typically corresponds to ServiceMap keys).
 *
 * @throws {TokenAlreadyRegisteredError} When attempting to register a token that already exists.
 * @throws {TokenNotRegisteredError} When attempting to resolve a token that has not been registered.
 * @throws {CircularDependencyError} When a circular dependency is detected during resolution.
 * @throws {ContainerError} When a service factory throws an error while resolving (wraps the original error).
 *
 * @example
 * const container = new Container();
 * container.register('logger', () => new Logger());
 * container.registerSingleton('config', () => loadConfig());
 * container.registerInstance('appName', 'MyApp');
 *
 * const logger = container.resolve('logger');
 */

export class Container implements IContainer {
  private readonly services = new Map<Token, ServiceRegistration>();
  private readonly resolutionStack: Token[] = [];

  /**
   * Registers a factory for a service under the specified token.
   *
   * @template T - The type of the service produced by the provided factory.
   * @param token - The token used to identify the service in the container.
   * @param factory - A function that is given the container and returns an instance of T.
   *
   * The registration stores the factory with a default lifecycle of "transient",
   * meaning a new instance is produced each time the service is resolved.
   *
   * @throws {TokenAlreadyRegisteredError} If a service is already registered for the given token.
   */

  public register<T>(token: Token, factory: (container: IContainer) => T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'transient' });
  }

  /**
   * Register a singleton service factory under the provided token.
   *
   * The factory is stored and marked with a 'singleton' lifecycle so that the
   * container will return the same instance for all subsequent resolutions of
   * the given token.
   *
   * @typeParam T - The type of the instance produced by the factory.
   * @param token - A unique token used to identify the service in the container.
   * @param factory - A factory function that receives the container and returns an instance of T.
   * @throws {TokenAlreadyRegisteredError} If a service is already registered for the given token.
   * @remarks
   * The factory itself is not invoked by this method; it is retained for use by
   * the container's resolution process. Use this method to ensure one shared
   * instance of T is provided for the lifetime of the container (or until the
   * registration is changed).
   */

  public registerSingleton<T>(token: Token, factory: (container: IContainer) => T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'singleton' });
  }

  /**
   * Registers a concrete instance with the container under the given token.
   *
   * The instance is stored as a singleton: the container records a factory that
   * always returns the provided instance and stores the instance for reuse.
   *
   * @typeParam T - The type of the instance being registered.
   * @param token - The token used to identify the service (e.g., string, symbol, or class).
   * @param instance - The concrete instance to register.
   *
   * @remarks
   * - Subsequent resolutions for `token` will return the same `instance`.
   * - This method mutates the container's internal service registry.
   *
   * @throws {TokenAlreadyRegisteredError} If the provided `token` is already registered.
   *
   * @returns void
   */

  public registerInstance<T>(token: Token, instance: T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory: () => instance, lifecycle: 'singleton', instance });
  }

  /**
   * Resolves a service identified by the given token from the container.
   *
   * This method will:
   * - Look up the registration for the provided token.
   * - Detect and prevent circular dependencies using an internal resolution stack.
   * - For singleton registrations, return the cached instance if present.
   * - Otherwise, push the token onto the resolution stack, invoke the registration's factory
   *   with the current container to create the service instance, cache it for singletons,
   *   and return the created instance.
   * - Ensure the resolution stack is popped regardless of success or failure.
   *
   * @template T - The specific token type being resolved. Must extend Token.
   * @param token - The token that identifies the service to resolve.
   * @returns The resolved service instance typed as ServiceMap[T].
   *
   * @throws {TokenNotRegisteredError} If no registration exists for the provided token.
   * @throws {CircularDependencyError} If resolving the token would create a circular dependency
   *         (the token is already present in the current resolution stack). Any CircularDependencyError
   *         raised by nested resolutions is rethrown unchanged.
   * @throws {ContainerError} If the factory throws any error other than CircularDependencyError,
   *         the error is wrapped in a ContainerError containing a diagnostic message and the token.
   *
   * @remarks
   * - Side effects:
   *   - May mutate the container's internal resolution stack.
   *   - May set the `instance` field on singleton registrations after successful creation.
   * - The factory is invoked with the container as its single argument, allowing factories to
   *   resolve other services as dependencies.
   */

  public resolve<T extends Token>(token: T): ServiceMap[T] {
    const registration = this.services.get(token);

    if (!registration) throw new TokenNotRegisteredError(token);
    if (this.resolutionStack.includes(token)) throw new CircularDependencyError(this.resolutionStack, token);
    if (registration.lifecycle === 'singleton' && registration.instance !== undefined) return registration.instance as ServiceMap[T];

    this.resolutionStack.push(token);

    try {
      const instance = registration.factory(this);
      if (registration.lifecycle === 'singleton') {
        registration.instance = instance;
      }
      return instance as ServiceMap[T];
    } catch (error) {
      if (error instanceof CircularDependencyError) throw error;
      throw new ContainerError(`Failed to resolve service '${token}': ${getErrorMessage(error)}`, token);
    } finally {
      this.resolutionStack.pop();
    }
  }

  /**
   * Determines whether a service identified by the given token is registered in the container.
   *
   * @param token - The token used to identify a service in the container.
   * @returns `true` if the container has a registration for the provided token; otherwise `false`.
   */

  public isRegistered(token: Token): boolean {
    return this.services.has(token);
  }
}
