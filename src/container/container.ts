export interface Factory<T> {
  (c: Container): T;
}
export interface Container {
  register<T>(token: symbol, factory: Factory<T>): void;
  registerSingleton<T>(token: symbol, factory: Factory<T>): void;
  registerInstance<T>(token: symbol, instance: T): void;
  resolve<T>(token: symbol): T;
}

type Entry =
  | { kind: 'factory'; factory: Factory<unknown> }
  | { kind: 'singleton'; factory: Factory<unknown>; instance?: unknown }
  | { kind: 'instance'; instance: unknown };

export class SimpleContainer implements Container {
  private readonly registry = new Map<symbol, Entry>();

  register<T>(token: symbol, factory: Factory<T>): void {
    this.registry.set(token, { kind: 'factory', factory });
  }
  registerSingleton<T>(token: symbol, factory: Factory<T>): void {
    this.registry.set(token, { kind: 'singleton', factory });
  }
  registerInstance<T>(token: symbol, instance: T): void {
    this.registry.set(token, { kind: 'instance', instance });
  }
  resolve<T>(token: symbol): T {
    const entry = this.registry.get(token);
    if (!entry) throw new Error(`DI: token ${token.toString()} not registered`);

    if (entry.kind === 'factory') return (entry.factory as Factory<T>)(this);

    if (entry.kind === 'singleton') {
      if (entry.instance === undefined) {
        entry.instance = (entry.factory as Factory<T>)(this);
        this.registry.set(token, entry);
      }
      return entry.instance as T;
    }
    return entry.instance as T;
  }
}
