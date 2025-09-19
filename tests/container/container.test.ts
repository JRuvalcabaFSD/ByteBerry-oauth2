import { Container } from '@/container';
import { IContainer } from '@/interfaces';
import { CircularDependencyError, TokenAlreadyRegisteredError } from '@/shared';

describe('Container', () => {
  let container: IContainer;
  const testToken = Symbol.for('TestService');
  const anotherToken = Symbol.for('AnotherService');

  beforeEach(() => {
    container = new Container();
  });

  afterEach(() => {
    container.clear();
  });
  describe('register and resolve', () => {
    it('should register and resolve transient dependency', () => {
      const factory = jest.fn(() => ({ id: Math.random() }));

      container.register(testToken, factory, 'transient');
      const instance1 = container.resolve(testToken);
      const instance2 = container.resolve(testToken);

      expect(factory).toHaveBeenCalledTimes(2);
      expect(instance1).not.toBe(instance2);
      expect(container.isRegistered(testToken)).toBeTruthy();
    });
    it('should register and resolve singleton dependency', () => {
      const factory = jest.fn(() => ({ id: 'singleton' }));

      container.registerSingleton(testToken, factory);
      const instance1 = container.resolve<{ id: string }>(testToken);
      const instance2 = container.resolve<{ id: string }>(testToken);

      expect(factory).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
      expect(instance1.id).toBe(instance2.id);
    });
    it('should register and resolve instance dependency', () => {
      const instance = { id: 'instance' };

      container.registerInstance(testToken, instance);
      const resolved = container.resolve<{ id: string }>(testToken);

      expect(resolved).toBe(instance);
      expect(resolved.id).toBe('instance');
    });
  });
  describe('error handling', () => {
    it('should throw TokenAlreadyRegisteredError when registering duplicate token', () => {
      container.register(testToken, () => ({}));

      expect(() => container.register(testToken, () => ({}))).toThrow(TokenAlreadyRegisteredError);
    });
    it('should throw CircularDependencyError when circular dependency detected', () => {
      container.registerSingleton(testToken, c => c.resolve(anotherToken));
      container.registerSingleton(anotherToken, c => c.resolve(testToken));

      expect(() => container.resolve(testToken)).toThrow(CircularDependencyError);
    });
  });
});
