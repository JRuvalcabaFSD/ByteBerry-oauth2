import { ServiceMap } from '@/container';

export type lifecycle = 'singleton' | 'transient';

export interface IContainer {
  register<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void;
  registerSingleton<K extends keyof ServiceMap>(token: K, factory: (container: IContainer) => ServiceMap[K]): void;
  registerInstance<K extends keyof ServiceMap>(token: K, instance: ServiceMap[K]): void;
  resolve<K extends keyof ServiceMap>(token: K): ServiceMap[K];
  isRegistered(token: keyof ServiceMap): boolean;
}
