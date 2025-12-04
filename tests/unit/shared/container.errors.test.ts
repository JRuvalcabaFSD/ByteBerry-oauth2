import {
	CircularDependencyError,
	ContainerCreationError,
	ContainerError,
	TokenAlreadyRegisteredError,
	TokenNotRegisteredError,
} from '@shared';

describe('Container Errors', () => {
	describe('ContainerError', () => {
		it('should create error with message and token', () => {
			const error = new ContainerError('Test error', 'Config');

			expect(error).toBeInstanceOf(Error);
			expect(error.name).toBe('ContainerError');
			expect(error.message).toBe('Test error');
			expect(error.token).toBe('Config');
			expect(error.errorType).toBe('container');
		});
	});

	describe('ContainerCreationError', () => {
		it('should create error with service not registered message', () => {
			const error = new ContainerCreationError('Config');

			expect(error).toBeInstanceOf(ContainerError);
			expect(error.name).toBe('ContainerCreationError');
			expect(error.message).toBe('Config service not registered');
			expect(error.token).toBe('Config');
		});
	});

	describe('TokenAlreadyRegisteredError', () => {
		it('should create error with already registered message', () => {
			const error = new TokenAlreadyRegisteredError('Config');

			expect(error).toBeInstanceOf(ContainerError);
			expect(error.name).toBe('TokenAlreadyRegisteredError');
			expect(error.message).toBe("Token 'Config' is already registered");
			expect(error.token).toBe('Config');
		});
	});

	describe('TokenNotRegisteredError', () => {
		it('should create error with not registered message', () => {
			const error = new TokenNotRegisteredError('Config');

			expect(error).toBeInstanceOf(ContainerError);
			expect(error.name).toBe('TokenNotRegisteredError');
			expect(error.message).toBe("Token 'Config' is not registered");
			expect(error.token).toBe('Config');
		});
	});

	describe('CircularDependencyError', () => {
		it('should create error with dependency chain description', () => {
			const dependencyChain = ['ServiceA', 'ServiceB', 'ServiceC'];
			const error = new CircularDependencyError(dependencyChain, 'ServiceA');

			expect(error).toBeInstanceOf(ContainerError);
			expect(error.name).toBe('CircularDependencyError');
			expect(error.message).toBe('Circular dependency detected: ServiceA -> ServiceB -> ServiceC -> ServiceA');
			expect(error.token).toBe('ServiceA');
		});
	});
});
