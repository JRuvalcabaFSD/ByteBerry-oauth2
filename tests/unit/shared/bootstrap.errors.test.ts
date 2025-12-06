import { BootstrapError } from '@shared';

describe('BootstrapError', () => {
	describe('Constructor', () => {
		it('should create error with message and context', () => {
			const message = 'Failed to initialize';
			const context = { service: 'database', port: 5432 };

			const error = new BootstrapError(message, context);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(message);
			expect(error.context).toEqual(context);
		});

		it('should set error name to "BootstrapError"', () => {
			const error = new BootstrapError('Test error', {});

			expect(error.name).toBe('BootstrapError');
		});

		it('should set erroType to "bootstrap"', () => {
			const error = new BootstrapError('Test error', {});

			expect(error.errorType).toBe('bootstrap');
		});
	});

	describe('Error Properties', () => {
		it('should preserve all context properties', () => {
			const context = {
				database: 'postgres',
				host: 'localhost',
				port: 5432,
				timeout: 30000,
				retries: 3,
			};

			const error = new BootstrapError('Connection failed', context);

			expect(error.context).toEqual(context);
			expect(error.context.database).toBe('postgres');
			expect(error.context.port).toBe(5432);
		});

		it('should handle empty context', () => {
			const error = new BootstrapError('Empty context error', {});

			expect(error.context).toEqual({});
			expect(Object.keys(error.context)).toHaveLength(0);
		});

		it('should handle complex context objects', () => {
			const context = {
				config: {
					host: 'localhost',
					port: 5432,
				},
				attempts: [1, 2, 3],
				metadata: {
					timestamp: '2025-01-15T10:00:00Z',
					user: 'system',
				},
			};

			const error = new BootstrapError('Complex error', context);

			expect(error.context).toEqual(context);
			expect(error.context.config).toEqual({ host: 'localhost', port: 5432 });
			expect(error.context.attempts).toEqual([1, 2, 3]);
		});
	});

	describe('Error Behavior', () => {
		it('should be throwable', () => {
			const throwError = () => {
				throw new BootstrapError('Throwable error', { reason: 'test' });
			};

			expect(throwError).toThrow(BootstrapError);
			expect(throwError).toThrow('Throwable error');
		});

		it('should be catchable with instanceof', () => {
			try {
				throw new BootstrapError('Catchable error', { code: 500 });
			} catch (error) {
				expect(error).toBeInstanceOf(BootstrapError);
				expect(error).toBeInstanceOf(Error);

				if (error instanceof BootstrapError) {
					expect(error.context.code).toBe(500);
				}
			}
		});

		it('should preserve stack trace', () => {
			const error = new BootstrapError('Stack trace test', {});

			expect(error.stack).toBeDefined();
			expect(error.stack).toContain('BootstrapError');
		});
	});

	describe('Context Immutability', () => {
		it('should allow reading context after creation', () => {
			const context = { value: 'test' };
			const error = new BootstrapError('Test', context);

			expect(error.context.value).toBe('test');
		});

		it('should preserve context reference', () => {
			const context = { data: 'original' };
			const error = new BootstrapError('Test', context);

			// Context should be the same object
			expect(error.context).toBe(context);
		});
	});
});
