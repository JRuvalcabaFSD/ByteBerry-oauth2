/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from './app.error.js';

/**
 * Custom error class for handling invalid JWT token scenarios.
 *
 * This error is thrown when a JWT token is malformed, expired, or fails validation.
 * Extends the AppError class to provide OAuth-specific error handling.
 *
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new InvalidTokenError('Token has expired');
 * throw new InvalidTokenError('Invalid token signature', 403);
 * ```
 */

export class InvalidTokenError extends AppError {
	/**
	 * Creates a new InvalidTokenError instance.
	 *
	 * @param message - The error message describing the token validation failure
	 * @param statusCode - The HTTP status code associated with the error (defaults to 401 Unauthorized)
	 */

	constructor(message: any, statusCode: any = 401) {
		let msg: string;
		if (message === null) {
			msg = 'null';
		} else if (typeof message === 'undefined') {
			msg = 'undefined';
		} else {
			msg = String(message);
		}
		super(msg, 'oauth');
		this.name = 'InvalidTokenError';
		Object.defineProperty(this, 'message', {
			value: msg,
			enumerable: true,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(this, 'statusCode', {
			value: statusCode,
			enumerable: true,
			writable: false,
			configurable: true,
		});
	}
}
