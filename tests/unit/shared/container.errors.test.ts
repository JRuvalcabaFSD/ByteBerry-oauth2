import * as Errors from '@shared';

describe('Container Errors', () => {
	describe('ContainerError', () => {
		it('should create error with message and token', () => {
			const error = new Errors.ContainerError('Test error', 'Config');

			expect(error).toBeInstanceOf(Error);
			expect(error.name).toBe('ContainerError');
			expect(error.message).toBe('Test error');
			expect(error.token).toBe('Config');
			expect(error.errorType).toBe('container');
		});
	});

	describe('ContainerCreationError', () => {
		it('should create error with service not registered message', () => {
			const error = new Errors.ContainerCreationError('Config');

			expect(error).toBeInstanceOf(Errors.ContainerError);
			expect(error.name).toBe('ContainerCreationError');
			expect(error.message).toBe('Config service not registered');
			expect(error.token).toBe('Config');
		});
	});

	describe('TokenAlreadyRegisteredError', () => {
		it('should create error with already registered message', () => {
			const error = new Errors.TokenAlreadyRegisteredError('Config');

			expect(error).toBeInstanceOf(Errors.ContainerError);
			expect(error.name).toBe('TokenAlreadyRegisteredError');
			expect(error.message).toBe("Token 'Config' is already registered");
			expect(error.token).toBe('Config');
		});
	});

	describe('TokenNotRegisteredError', () => {
		it('should create error with not registered message', () => {
			const error = new Errors.TokenNotRegisteredError('Config');

			expect(error).toBeInstanceOf(Errors.ContainerError);
			expect(error.name).toBe('TokenNotRegisteredError');
			expect(error.message).toBe("Token 'Config' is not registered");
			expect(error.token).toBe('Config');
		});
	});

	describe('CircularDependencyError', () => {
		it('should create error with dependency chain description', () => {
			const dependencyChain = ['ServiceA', 'ServiceB', 'ServiceC'];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const error = new Errors.CircularDependencyError(dependencyChain, 'ServiceA' as any);

			expect(error).toBeInstanceOf(Errors.ContainerError);
			expect(error.name).toBe('CircularDependencyError');
			expect(error.message).toBe('Circular dependency detected: ServiceA -> ServiceB -> ServiceC -> ServiceA');
			expect(error.token).toBe('ServiceA');
		});
	});
});
