/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface IContainer<TServiceMap extends Record<TToken, any>, TToken extends Token = Token> {
  register<T>(token: TToken, factory: (container: IContainer<TServiceMap, TToken>) => T): void;
  registerSingleton<T>(token: TToken, factory: (container: IContainer<TServiceMap, TToken>) => T): void;
  registerInstance<T>(token: TToken, instance: T): void;
  resolve<T extends TToken>(token: T): TServiceMap[T];
  isRegistered(token: TToken): boolean;
}
