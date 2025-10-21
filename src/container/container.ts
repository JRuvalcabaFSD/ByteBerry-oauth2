/* eslint-disable @typescript-eslint/no-explicit-any */
import { Token } from '@/container/tokens';
import { IContainer, lifecycle } from '@/interfaces';
import { CircularDependencyError, ContainerError, getErrorMessage, TokenAlreadyRegisteredError, TokenNotRegisteredError } from '@/shared';

interface ServiceRegistration<T = any, TServiceMap extends Record<TToken, any> = any, TToken extends Token = Token> {
  factory: (container: IContainer<TServiceMap, TToken>) => T;
  lifecycle: lifecycle;
  instance?: T;
}

export class Container<TServiceMap extends Record<TToken, any>, TToken extends Token = Token> implements IContainer<TServiceMap, TToken> {
  private readonly services = new Map<TToken, ServiceRegistration<any, TServiceMap, TToken>>();
  private readonly resolutionStack: TToken[] = [];

  public register<T>(token: TToken, factory: (container: IContainer<TServiceMap, TToken>) => T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'transient' });
  }

  public registerSingleton<T>(token: TToken, factory: (container: IContainer<TServiceMap, TToken>) => T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory, lifecycle: 'singleton' });
  }

  public registerInstance<T>(token: TToken, instance: T): void {
    if (this.services.has(token)) throw new TokenAlreadyRegisteredError(token);
    this.services.set(token, { factory: () => instance, lifecycle: 'singleton', instance });
  }

  public resolve<T extends TToken>(token: T): TServiceMap[T] {
    const registration = this.services.get(token);

    if (!registration) throw new TokenNotRegisteredError(token);
    if (this.resolutionStack.includes(token)) throw new CircularDependencyError(this.resolutionStack, token);
    if (registration.lifecycle === 'singleton' && registration.instance !== undefined) return registration.instance as TServiceMap[T];

    this.resolutionStack.push(token);

    try {
      const instance = registration.factory(this);
      if (registration.lifecycle === 'singleton') {
        registration.instance = instance;
      }
      return instance as TServiceMap[T];
    } catch (error) {
      if (error instanceof CircularDependencyError) throw error;
      throw new ContainerError(`Failed to resolve service '${token}': ${getErrorMessage(error)}`, token);
    } finally {
      this.resolutionStack.pop();
    }
  }

  public isRegistered(token: TToken): boolean {
    return this.services.has(token);
  }
}
