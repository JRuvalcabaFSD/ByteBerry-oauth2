import { ConfigError } from '@shared';

describe('Config Errors', () => {
	describe('ConfigError', () => {
		it('should create ConfigError with message', () => {
			const error = new ConfigError('Invalid config');
			expect(error.message).toBe('Invalid config');
			expect(error.name).toBe('ConfigError');
			expect(error.errorType).toBe('config');
		});

		it('should include context when provided', () => {
			const context = { variable: 'DATABASE_URL' };
			const error = new ConfigError('Missing variable', context);
			expect(error.context).toEqual(context);
		});

		it('should have undefined context when not provided', () => {
			const error = new ConfigError('Test error');
			expect(error.context).toBeUndefined();
		});
	});
});
