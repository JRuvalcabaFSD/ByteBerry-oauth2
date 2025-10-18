import { ServiceMap, Token } from '@/container';

/**
 * Specifies how a dependency is managed by the IoC container.
 *
 * Allowed values:
 * - "singleton": A single instance is created and shared for all resolutions.
 * - "transient": A new instance is created on each resolution.
 *
 * Use this type when registering or configuring services to control instance
 * lifetime and resource sharing semantics.
 *
 * @example
 * // Registering a service as a singleton (one shared instance)
 * container.register(MyService, { lifecycle: 'singleton' });
 *
 * @example
 * // Registering a service as transient (new instance per resolution)
 * container.register(MyService, { lifecycle: 'transient' });
 *
 * @remarks
 * The exact disposal or teardown behavior for singletons depends on the
 * container implementation. Transient instances typically are not tracked
 * by the container after creation unless the container explicitly manages them.
 *
 * @public
 */

export type lifecycle = 'singleton' | 'transient';

/**
 * A lightweight dependency injection container interface.
 *
 * Provides registration and resolution primitives for services identified by a "Token".
 * Implementations are expected to manage service lifetimes (transient vs singleton),
 * support registering pre-created instances, and allow resolving services by token.
 *
 * The container is passed into factories so factories may resolve other dependencies
 * from the same container (enabling nested or dependent registrations).
 *
 * Remarks:
 * - Token is a unique service identifier (e.g. string, symbol, constructor, or a dedicated token type).
 * - ServiceMap is a project-specific mapping from Token to the concrete service type returned by `resolve`.
 * - Implementations may throw an error when resolving an unregistered token; callers should either
 *   check `isRegistered` first or handle resolution errors.
 *
 * Methods:
 * @template T - The type produced by the provided factory or instance when registering.
 * @param token - The identifier used to register or resolve a service.
 * @param factory - A function that produces an instance of the service. Receives the container to allow
 *                  resolving other dependencies during construction.
 * @returns void for registration methods.
 *
 * register:
 * - Registers a factory that produces a new instance each time `resolve` is called (transient lifetime).
 *
 * registerSingleton:
 * - Registers a factory whose returned instance is created once (lazily on first resolve or eagerly,
 *   depending on implementation) and reused for subsequent resolves (singleton lifetime).
 *
 * registerInstance:
 * - Registers an already-created instance for the given token. The provided instance is returned on resolve.
 *
 * resolve:
 * - Resolves and returns the service associated with the token. The generic return type corresponds
 *   to the mapping declared in ServiceMap for the given token.
 *
 * isRegistered:
 * - Returns true if a factory, singleton, or instance has been registered for the token; otherwise false.
 */

export interface IContainer {
  register<T>(token: Token, factory: (container: IContainer) => T): void;
  registerSingleton<T>(token: Token, factory: (container: IContainer) => T): void;
  registerInstance<T>(token: Token, instance: T): void;
  resolve<T extends Token>(token: T): ServiceMap[T];
  isRegistered(token: Token): boolean;
}
