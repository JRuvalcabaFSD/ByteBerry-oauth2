import { HttpError, CorsOriginError } from '@shared';

describe('HTTP Errors', () => {
	describe('HttpError', () => {
		it('should create HttpError with all properties', () => {
			const error = new HttpError('Not Found', 'http', 'ResourceMissing', 404);
			expect(error.message).toBe('Not Found');
			expect(error.errorCause).toBe('ResourceMissing');
			expect(error.statusCode).toBe(404);
			expect(error.name).toBe('HttpError');
		});

		it('should serialize to JSON correctly', () => {
			const error = new HttpError('Bad Request', 'http', 'ValidationError', 400);
			const json = error.toJSON();
			expect(json).toEqual({
				error: 'ValidationError',
				message: 'Bad Request',
				statusCode: 400,
			});
		});
	});

	describe('CorsOriginError', () => {
				it('should handle empty string origin', () => {
					const error = new CorsOriginError('');
					expect(error.message).toBe('Origin  not allowed by CORS');
					expect(error.origin).toBe('');
				});
		it('should create error with origin message', () => {
			const error = new CorsOriginError('https://evil.com');
			expect(error.message).toContain('https://evil.com');
			expect(error.message).toContain('not allowed by CORS');
			expect(error.origin).toBe('https://evil.com');
		});

		it('should handle null origin', () => {
			const error = new CorsOriginError(null);
			expect(error.message).toBeDefined();
			expect(error.origin).toBeNull();
		});

		it('should handle undefined origin', () => {
			const error = new CorsOriginError(undefined);
			expect(error.message).toBeDefined();
			expect(error.origin).toBeUndefined();
		});
	});
});
