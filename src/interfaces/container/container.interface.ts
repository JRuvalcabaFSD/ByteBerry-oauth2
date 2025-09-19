export type LifecycleType = 'singleton' | 'transient';

/**
 * Interface for the implementation of Di Container
 * @export
 * @interface IContainer
 */
export interface IContainer {
  [x: string]: any;
  /**
   * Record a new service
   * @template T
   * @param {symbol} token
   * @param {(container: IContainer) => T} factory
   * @param {LifecycleType} [lifecycle]
   * @memberof IContainer
   */
  register<T>(token: symbol, factory: (container: IContainer) => T, lifecycle?: LifecycleType): void;

  /**
   * Register a service by a Singleton
   * @template T
   * @param {symbol} token
   * @param {(container: IContainer) => T} factory
   * @memberof IContainer
   */
  registerSingleton<T>(token: symbol, factory: (container: IContainer) => T): void;

  /**
   * Register a instance of service
   * @template T
   * @param {symbol} token
   * @param {T} instance
   * @memberof IContainer
   */
  registerInstance<T>(token: symbol, instance: T): void;

  /**
   * Returns the service instance
   * @template T
   * @param {symbol} token
   * @return {*}  {T}
   * @memberof IContainer
   */
  resolve<T>(token: symbol): T;

  /**
   * Indicates whether a service is registered at Di Container
   * @param {symbol} token
   * @return {*}  {boolean}
   * @memberof IContainer
   */
  isRegistered(token: symbol): boolean;
}
