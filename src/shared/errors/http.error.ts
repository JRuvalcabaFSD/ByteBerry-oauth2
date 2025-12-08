import { AppError, ErrorType } from '@shared';

/**
 * Represents an HTTP-related error with an associated status code.
 *
 * @extends AppError
 *
 * @remarks
 * This error class is used to handle HTTP errors throughout the application.
 * It captures the error message and HTTP status code, and automatically
 * captures the stack trace when available.
 *
 * @example
 * ```typescript
 * throw new HttpError('Not Found', 404);
 * throw new HttpError('Internal Server Error', 500);
 * ```
 */

export class HttpError extends AppError {
	public readonly statusCode: number;
	public readonly errorCause: string;

	/**
	 * Creates an instance of HttpError.
	 *
	 * @param message - The error message describing what went wrong
	 * @param cause - The underlying cause or reason for the HTTP error
	 * @param statusCode - The HTTP status code associated with this error
	 */

	constructor(message: string, erroType: ErrorType, cause: string, statusCode: number) {
		super(message, erroType);
		this.statusCode = statusCode;
		this.name = 'HttpError';
		this.errorCause = cause;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, HttpError);
		}
	}

	public toJSON(): { error: string; message: string; statusCode: number } {
		return {
			error: this.errorCause,
			message: this.message,
			statusCode: this.statusCode,
		};
	}
}

// ========================================
// Cors Errors
// ========================================

/**
 * Error thrown when a request origin is not allowed by CORS (Cross-Origin Resource Sharing) policy.
 *
 * @extends HttpError
 *
 * @example
 * ```typescript
 * throw new CorsOriginError('https://unauthorized-domain.com');
 * ```
 */
export class CorsOriginError extends HttpError {
	public readonly origin: string;

	/**
	 * Creates a new CorsOriginError instance.
	 *
	 * @param origin - The origin that was not allowed by CORS policy
	 *
	 * @remarks
	 * This constructor initializes a CORS error with a 200 status code and captures
	 * the stack trace if the environment supports it. The error name is set to 'CorsOriginError'.
	 */

	constructor(origin: string) {
		super(`Origin ${origin} not allowed by CORS`, 'http', 'Invalid CORS', 200);
		this.origin = origin;
		this.name = 'CorsOriginError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CorsOriginError);
		}
	}
}

export class OAuthError extends HttpError {
	constructor(message: string, cause: string, statusCode: number = 400) {
		super(message, 'oauth', cause, statusCode);
		this.name = 'OAuthError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, OAuthError);
		}
	}
}

/**
 * Represents an OAuth 2.0 invalid request error.
 *
 * This error is thrown when the request is missing a required parameter, includes an
 * invalid parameter value, includes a parameter more than once, or is otherwise malformed.
 *
 * @extends OAuthError
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 | RFC 6749 Section 5.2}
 *
 * @example
 * ```typescript
 * throw new InvalidRequestError('Missing required parameter: client_id');
 * ```
 */

export class InvalidRequestError extends OAuthError {
	/**
	 * Creates an instance of InvalidRequestError.
	 *
	 * @param message - A descriptive error message explaining why the request is invalid
	 *
	 * @remarks
	 * This constructor initializes an OAuth2 error with the error code 'INVALID_REQUEST'
	 * and HTTP status code 400. It also captures the stack trace for debugging purposes
	 * when available in the JavaScript environment.
	 */

	constructor(message: string) {
		super(message, 'Invalid Request', 400);
		this.name = 'InvalidRequestError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, InvalidRequestError);
		}
	}
}

/**
 * Error thrown when client authentication fails during OAuth2 operations.
 *
 * This error is typically thrown when:
 * - Invalid client credentials are provided
 * - Client ID is not found
 * - Client secret is incorrect
 * - Client authentication method is not supported
 *
 * @extends OAuthError
 *
 * @remarks
 * This error corresponds to the `invalid_client` error code defined in RFC 6749 (OAuth 2.0).
 * It results in a 401 Unauthorized HTTP status code.
 *
 * @example
 * ```typescript
 * throw new InvalidClientError('Invalid client credentials provided');
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 | RFC 6749 Section 5.2}
 */

export class InvalidClientError extends OAuthError {
	/**
	 * Creates an instance of InvalidClientError.
	 *
	 * @param message - The error message describing the client authentication failure.
	 *                  Defaults to 'Client authentication failed' if not provided.
	 *
	 * @remarks
	 * This constructor initializes an OAuth2 error with the 'INVALID_CLIENT' error code
	 * and a 401 HTTP status code. It also captures the stack trace for debugging purposes
	 * when available in the runtime environment.
	 */

	constructor(message: string = 'Client authentication failed') {
		super(message, 'Invalid Client', 401);
		this.name = 'InvalidClientError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, InvalidClientError);
		}
	}
}

/**
 * Error thrown when an authorization grant is invalid or has expired.
 *
 * This error is typically used in OAuth2 flows when:
 * - The authorization code has expired
 * - The authorization code has already been used
 * - The authorization code is invalid or malformed
 * - The refresh token is invalid or expired
 *
 * @extends OAuthError
 *
 * @example
 * ```typescript
 * throw new InvalidGrantError('Authorization code has expired');
 * ```
 */

export class InvalidGrantError extends OAuthError {
	/**
	 * Creates an instance of InvalidGrantError.
	 *
	 * @param message - The error message describing the invalid grant. Defaults to 'Invalid authorization grant'.
	 *
	 * @remarks
	 * This constructor initializes an OAuth error with error code 'INVALID_GRANT' and HTTP status 401.
	 * It also captures the stack trace for better debugging when available.
	 */

	constructor(message: string = 'Invalid authorization grant') {
		super(message, 'Invalid Grant', 401);
		this.name = 'InvalidGrantError ';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, InvalidGrantError);
		}
	}
}

/**
 * Error thrown when a client is not authorized to perform an OAuth operation.
 *
 * This error is returned when the client lacks proper authorization credentials
 * or permissions to access the requested resource. It corresponds to HTTP status 401.
 *
 * @extends OAuthError
 *
 * @example
 * ```typescript
 * throw new UnauthorizedClientError('Client credentials are invalid');
 * ```
 */

export class UnauthorizedClientError extends OAuthError {
	/**
	 * Creates an instance of UnauthorizedClientError.
	 *
	 * @param {string} [message='Client not authorized'] - The error message describing the unauthorized client condition
	 *
	 * @remarks
	 * This constructor initializes an OAuth error with:
	 * - Error code: 'UNAUTHORIZED_CLIENT'
	 * - HTTP status code: 401
	 * - Captures the stack trace for debugging purposes when available
	 */

	constructor(message: string = 'Client not authorized') {
		super(message, 'Unauthorized Client', 401);
		this.name = 'UnauthorizedClientError  ';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, UnauthorizedClientError);
		}
	}
}
