import {
	ContainerError,
	ContainerCreationError,
	TokenAlreadyRegisteredError,
	TokenNotRegisteredError,
	CircularDependencyError,
} from '@shared';

describe('Container Errors', () => {
	describe('ContainerError', () => {
		it('should create ContainerError with message and token', () => {
			const error = new ContainerError('Test error', 'Config');
			expect(error.message).toBe('Test error');
			expect(error.token).toBe('Config');
			expect(error.name).toBe('ContainerError');
		});
	});

	describe('ContainerCreationError', () => {
		it('should create error with service not registered message', () => {
			const error = new ContainerCreationError('Logger');
			expect(error.message).toBe('Logger service not registered');
			expect(error.token).toBe('Logger');
		});
	});

	describe('TokenAlreadyRegisteredError', () => {
		it('should create error with already registered message', () => {
			const error = new TokenAlreadyRegisteredError('Logger');
			expect(error.message).toBe('Token Logger is already registered');
			expect(error.token).toBe('Logger');
		});
	});

	describe('TokenNotRegisteredError', () => {
		it('should create error with not registered message', () => {
			const error = new TokenNotRegisteredError('Config');
			expect(error.message).toBe('Token Config is not registered');
			expect(error.token).toBe('Config');
		});
	});

	describe('CircularDependencyError', () => {
		it('should create error with dependency chain description', () => {
			const error = new CircularDependencyError(['Config', 'Logger'], 'Config');
			expect(error.message).toContain('circular dependency detected');
			expect(error.message).toContain('Config');
			expect(error.message).toContain('Logger');
		});
	});
});
