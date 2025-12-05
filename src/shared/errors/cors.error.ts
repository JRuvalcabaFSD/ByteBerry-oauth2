/**
 * Error thrown when a request origin is not allowed by CORS (Cross-Origin Resource Sharing) policy.
 *
 * @remarks
 * This error is thrown when a client attempts to make a request from an origin that is not
 * included in the allowed origins list configured for the application.
 *
 * @example
 * ```typescript
 * throw new CorsOriginError('https://unauthorized-domain.com');
 * ```
 *
 * @public
 */

export class CorsOriginError extends Error {
	public readonly errorType = 'cors';
	public readonly origin: string;

	/**
	 * Creates a new CorsOriginError instance.
	 * @param origin - The origin URL that was not allowed by CORS policy
	 */
	constructor(origin: string) {
		super(`Origin ${origin} not allowed by CORS`);
		this.origin = origin;
		this.name = 'CorsOriginError';
	}
}
