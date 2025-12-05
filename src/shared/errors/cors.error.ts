import { AppError } from '@shared';

/**
 * Error thrown when a request origin is not allowed by CORS (Cross-Origin Resource Sharing) policy.
 *
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new CorsOriginError('https://unauthorized-domain.com');
 * ```
 *
 * @remarks
 * This error is typically thrown during HTTP request processing when the request's origin
 * header does not match any of the allowed origins in the CORS configuration.
 *
 * @public
 */

export class CorsOriginError extends AppError {
	public readonly origin: string;

	/**
	 * Creates a new CorsOriginError instance.
	 * @param origin - The origin URL that was not allowed by CORS policy
	 */
	constructor(origin: string) {
		super(`Origin ${origin} not allowed by CORS`, 'http');
		this.origin = origin;
		this.name = 'CorsOriginError';
	}
}
