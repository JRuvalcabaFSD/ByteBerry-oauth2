import { AppError } from '@domain';

describe('Domain Errors', () => {
	describe('AppError', () => {
		it('should create AppError with message and type', () => {
			const error = new AppError('Test error', 'domain');
			expect(error.message).toBe('Test error');
			expect(error.errorType).toBe('domain');
			expect(error.name).toBe('AppError');
		});

		it('should support all error types', () => {
			const types = ['bootstrap', 'config', 'container', 'http', 'oauth', 'domain'];
			types.forEach((type) => {
				const error = new AppError('Test', type as any);
				expect(error.errorType).toBe(type);
			});
		});

		it('should capture stack trace', () => {
			const error = new AppError('Test error', 'domain');
			expect(error.stack).toBeDefined();
		});
	});
});
