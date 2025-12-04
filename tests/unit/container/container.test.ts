import { describe, it, expect, beforeEach } from 'vitest';
import { TokenAlreadyRegisteredError, TokenNotRegisteredError, CircularDependencyError, ContainerError } from '@shared';
import { Container } from '@container';

describe('Container', () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
	});

	describe('Service Registration', () => {
		it('should register and resolve a transient service', () => {
			const factory = () => ({ value: 'test' });
			container.register('Config', factory);

			const instance1 = container.resolve('Config');
			const instance2 = container.resolve('Config');

			expect(instance1).toEqual({ value: 'test' });
			expect(instance2).toEqual({ value: 'test' });
			expect(instance1).not.toBe(instance2); // Different instances
		});

		it('should register and resolve a singleton service', () => {
			const factory = () => ({ value: Math.random() });
			container.registerSingleton('Config', factory);

			const instance1 = container.resolve('Config');
			const instance2 = container.resolve('Config');

			expect(instance1).toBe(instance2); // Same instance
		});

		it('should register and resolve a pre-existing instance', () => {
			const existingInstance = { value: 'existing' };
			container.registerInstance('Config', existingInstance);

			const resolved = container.resolve('Config');

			expect(resolved).toBe(existingInstance);
		});

		it('should throw TokenAlreadyRegisteredError when registering duplicate token', () => {
			container.register('Config', () => ({ value: 'first' }));

			expect(() => container.register('Config', () => ({ value: 'second' }))).toThrow(TokenAlreadyRegisteredError);
		});
	});

	describe('Service Resolution', () => {
		it('should throw TokenNotRegisteredError when resolving unregistered token', () => {
			expect(() => container.resolve('Config')).toThrow(TokenNotRegisteredError);
		});

		it('should detect circular dependencies', () => {
			container.register('Config', (c) => {
				c.resolve('Config'); // Circular dependency
				return { value: 'test' };
			});

			expect(() => container.resolve('Config')).toThrow(CircularDependencyError);
		});

		it('should throw ContainerError when factory fails', () => {
			container.register('Config', () => {
				throw new Error('Factory failed');
			});

			expect(() => container.resolve('Config')).toThrow(ContainerError);
			expect(() => container.resolve('Config')).toThrow('Failed to resolve service');
		});

		it('should return cached singleton instance on subsequent resolutions', () => {
			let callCount = 0;
			container.registerSingleton('Config', () => {
				callCount++;
				return { value: 'singleton', count: callCount };
			});

			const first = container.resolve('Config');
			const second = container.resolve('Config');

			expect(callCount).toBe(1); // Factory called only once
			expect(first).toBe(second);
			expect((first as any).count).toBe(1);
		});

		it('should clean up resolution stack after successful resolution', () => {
			container.register('Config', () => ({ value: 'test' }));

			// Primera resolución
			container.resolve('Config');

			// Segunda resolución debería funcionar sin problemas
			// Si el stack no se limpia, podría causar problemas
			expect(() => container.resolve('Config')).not.toThrow();
		});

		it('should clean up resolution stack after failed resolution', () => {
			container.register('Config', () => {
				throw new Error('Intentional failure');
			});

			// Primera resolución falla
			expect(() => container.resolve('Config')).toThrow(ContainerError);

			// Segunda resolución debería lanzar el mismo error
			// El stack debería estar limpio
			expect(() => container.resolve('Config')).toThrow(ContainerError);
		});
	});

	describe('Service Registration Check', () => {
		it('should return true for registered service', () => {
			container.register('Config', () => ({ value: 'test' }));

			expect(container.isRegistered('Config')).toBe(true);
		});

		it('should return false for unregistered service', () => {
			expect(container.isRegistered('Config')).toBe(false);
		});

		it('should return true for registered singleton', () => {
			container.registerSingleton('Config', () => ({ value: 'singleton' }));

			expect(container.isRegistered('Config')).toBe(true);
		});

		it('should return true for registered instance', () => {
			container.registerInstance('Config', { value: 'instance' });

			expect(container.isRegistered('Config')).toBe(true);
		});
	});

	describe('Edge Cases and Error Propagation', () => {
		it('should propagate ConfigError without wrapping', () => {
			const ConfigError = class extends Error {
				constructor(message: string) {
					super(message);
					this.name = 'ConfigError';
				}
			};

			container.register('Config', () => {
				throw new ConfigError('Invalid configuration');
			});

			expect(() => container.resolve('Config')).toThrow('Invalid configuration');
		});

		it('should propagate CircularDependencyError without wrapping', () => {
			container.register('Config', (c) => {
				c.resolve('Config');
				return { value: 'test' };
			});

			expect(() => container.resolve('Config')).toThrow(CircularDependencyError);
		});

		it('should wrap generic errors in ContainerError', () => {
			container.register('Config', () => {
				throw new TypeError('Type mismatch');
			});

			expect(() => container.resolve('Config')).toThrow(ContainerError);
			expect(() => container.resolve('Config')).toThrow('Failed to resolve service');
		});
	});
});
