/**
 * Describes the lifecycle strategy used by the dependency injection container
 * to manage instances of a registered dependency.
 *
 * Values:
 * - 'singleton': One shared instance is created and reused for the container's lifetime.
 * - 'transient': A new instance is created on every resolution.
 *
 * @remarks
 * Choose 'singleton' for shared, stateful services and 'transient' for stateless or short-lived services.
 *
 * @example
 * container.bind(UserRepository).lifecycle('singleton');
 * container.bind(RequestHandler).lifecycle('transient');
 *
 * @public
 */

export type LifecycleType = 'singleton' | 'transient';

/**
 * Defines a minimal inversion-of-control (IoC) container API for registering and resolving
 * services by unique symbol tokens. Implementations typically support:
 * - Transient factories that create a new instance per resolution
 * - Singleton factories that cache and reuse a single instance
 * - Prebuilt instances for externally constructed services
 *
 * Tokens should be unique Symbols to avoid collisions across modules and packages.
 * Thread-safety, error handling, and re-registration semantics are implementation-defined.
 *
 * @public
 */

export interface IContainer {
  /**
   * Registers a transient factory for a service. A new instance is created each time the token is resolved.
   *
   * @typeParam T - The service type produced by the factory.
   * @param token - A unique symbol that identifies the service.
   * @param factory - A factory function that can use the container to resolve dependencies.
   *
   * @remarks
   * - The factory may call container.resolve to compose dependencies.
   * - Behavior when registering a token that is already present is implementation-defined.
   *
   * @example
   * interface Clock { now(): number }
   * const CLOCK = Symbol("Clock");
   * container.register<Clock>(CLOCK, () => ({ now: () => Date.now() }));
   * const a = container.resolve<Clock>(CLOCK);
   * const b = container.resolve<Clock>(CLOCK);
   * // a !== b (transient)
   */

  register<T>(token: symbol, factory: (container: IContainer) => T): void;

  /**
   * Registers a singleton factory for a service. The instance is created once (often lazily) and reused.
   *
   * @typeParam T - The service type produced by the factory.
   * @param token - A unique symbol that identifies the service.
   * @param factory - A factory function that can use the container to resolve dependencies.
   *
   * @remarks
   * - Implementations typically create the instance on first resolve (lazy), but this is not guaranteed.
   * - Behavior when re-registering the same token is implementation-defined.
   *
   * @example
   * class RandomIdGen { next() { return Math.random().toString(36).slice(2); } }
   * const ID_GEN = Symbol("IdGen");
   * container.registerSingleton<RandomIdGen>(ID_GEN, () => new RandomIdGen());
   * const a = container.resolve<RandomIdGen>(ID_GEN);
   * const b = container.resolve<RandomIdGen>(ID_GEN);
   * // a === b (singleton)
   */

  registerSingleton<T>(token: symbol, factory: (container: IContainer) => T): void;

  /**
   * Registers an already constructed instance for a token.
   *
   * @typeParam T - The service type of the instance.
   * @param token - A unique symbol that identifies the service.
   * @param instance - The instance to associate with the token.
   *
   * @remarks
   * Useful for configuration objects, external resources, or test doubles.
   *
   * @example
   * const CONFIG = Symbol("Config");
   * container.registerInstance<{ baseUrl: string }>(CONFIG, { baseUrl: "https://api.example.com" });
   */

  registerInstance<T>(token: symbol, instance: T): void;

  /**
   * Resolves and returns a service instance associated with the given token.
   *
   * @typeParam T - The expected service type.
   * @param token - The unique symbol used to look up the service.
   * @returns The resolved service instance.
   *
   * @remarks
   * - Implementations typically throw if the token has not been registered.
   * - Resolution may trigger factory execution (for transient/singleton registrations).
   */

  resolve<T>(token: symbol): T;

  /**
   * Determines whether a token has any registration in the container.
   *
   * @param token - The unique symbol that identifies the service.
   * @returns True if the token is registered; otherwise, false.
   */

  isRegistered(token: symbol): boolean;
}
