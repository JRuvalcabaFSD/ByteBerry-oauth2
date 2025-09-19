import type { IContainer, LifecycleType } from '@/interfaces';
import { CircularDependencyError, DependencyCreationError, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

interface ContainerRegistration<T = unknown> {
  factory: (container: IContainer) => T;
  lifecycle: LifecycleType;
  instance?: T;
}

/**
 * Pure Dependency Injection Container with Constructor Injection using Symbol tokens
 * @export
 * @class Container
 * @implements {IContainer}
 */
export class Container implements IContainer {
  private readonly registrations = new Map<symbol, ContainerRegistration>();
  private readonly resolutionStack = new Set<symbol>();

  /**
   * Register a dependency with constructor injection factory
   * @template T
   * @param {symbol} token Symbol token for type-safe dependency registration
   * @param {(container: IContainer) => T} factory Factory function that receives container for dependency injection
   * @param {LifecycleType} [lifecycle='transient']
   * @throws {TokenAlreadyRegisteredError} When token is already registered
   * @memberof Container
   */
  public register<T>(token: symbol, factory: (container: IContainer) => T, lifecycle: LifecycleType = 'transient'): void {
    if (this.registrations.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.registrations.set(token, { factory, lifecycle });
  }

  /**
   * Register a singleton dependency with constructor injection
   * @template T
   * @param {symbol} token Symbol token for type-safe dependency registration
   * @param {(container: IContainer) => T} factory
   * @throws {TokenAlreadyRegisteredError} When token is already registered
   * @memberof Container
   */
  public registerSingleton<T>(token: symbol, factory: (container: IContainer) => T): void {
    this.register(token, factory, 'singleton');
  }

  /**
   * Register an existing instance as singleton
   * @template T
   * @param {symbol} token
   * @param {T} instance
   * @throws {TokenAlreadyRegisteredError} When token is already registered
   * @memberof Container
   */
  public registerInstance<T>(token: symbol, instance: T): void {
    if (this.registrations.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.registrations.set(token, { factory: () => instance, lifecycle: 'singleton', instance });
  }

  /**
   * Resolve a dependency using Pure DI with constructor injection
   * @template T
   * @param {symbol} token Symbol token for type-safe dependency resolution
   * @return {*}  {T}
   * @throws {TokenNotRegisteredError} When token is not registered
   * @throws {CircularDependencyError} When circular dependency is detected
   * @throws {DependencyCreationError} When factory function fails
   * @memberof Container
   */
  public resolve<T>(token: symbol): T {
    if (this.resolutionStack.has(token)) {
      const dependencyChain = Array.from(this.resolutionStack);
      throw new CircularDependencyError(dependencyChain, token);
    }

    const registration = this.registrations.get(token);
    if (!registration) throw new TokenNotRegisteredError(token);

    if (registration.lifecycle === 'singleton' && registration.instance !== undefined) return registration.instance as T;

    this.resolutionStack.add(token);

    try {
      const instance = registration.factory(this) as T;

      if (registration.lifecycle === 'singleton') {
        registration.instance = instance;
      }

      return instance;
    } catch (error) {
      if (error instanceof CircularDependencyError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new DependencyCreationError(token, error);
      }
      throw error;
    } finally {
      this.resolutionStack.delete(token);
    }
  }

  /**
   * Check if a token is registered
   * @param {symbol} token Symbol token to check
   * @return {*}  {boolean}
   * @memberof Container
   */
  public isRegistered(token: symbol): boolean {
    return this.registrations.has(token);
  }

  /**
   * Get all registered tokens (for debugging)
   * @return {*}  {string[]}
   * @memberof Container
   */
  public getRegisteredTokens(): string[] {
    return Array.from(this.registrations.keys()).map(token => token.toString());
  }

  /**
   * Clear all registrations (for testing)
   * @memberof Container
   */
  public clear(): void {
    this.registrations.clear();
    this.resolutionStack.clear();
  }
}
