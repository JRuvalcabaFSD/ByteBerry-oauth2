import { BootstrapError } from '@shared';

describe('Bootstrap Errors', () => {
	describe('BootstrapError', () => {
		it('should create BootstrapError with message', () => {
			const error = new BootstrapError('Failed to start service');
			expect(error.message).toBe('Failed to start service');
			expect(error.name).toBe('BootstrapError');
			expect(error.errorType).toBe('bootstrap');
		});

		it('should include context when provided', () => {
			const context = { dbHost: 'localhost' };
			const error = new BootstrapError('DB connection failed', context);
			expect(error.context).toEqual(context);
		});

		it('should have undefined context when not provided', () => {
			const error = new BootstrapError('Test error');
			expect(error.context).toBeUndefined();
		});
	});
});
