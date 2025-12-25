import { AppError, ErrorType } from '@domain';

/**
 * Represents an HTTP error with additional metadata such as status code and error cause.
 * Extends the {@link AppError} class to provide more context for HTTP-related errors.
 *
 * @remarks
 * This error class is useful for propagating HTTP-specific error information
 * throughout your application, especially in APIs and web services.
 *
 * @example
 * ```typescript
 * throw new HttpError('Not Found', ErrorType.NotFound, 'ResourceMissing', 404);
 * ```
 *
 * @property {number} statusCode - The HTTP status code associated with the error.
 * @property {string} errorCause - A string describing the cause of the error.
 *
 * @method toJSON - Serializes the error to a JSON object containing the error cause, message, and status code.
 */

export class HttpError extends AppError {
	public readonly statusCode: number;
	public readonly errorCause: string;

	constructor(msg: string, type: ErrorType, cause: string, statusCode: number) {
		super(msg, type);
		this.statusCode = statusCode;
		this.name = 'HttpError';
		this.errorCause = cause;
		this.statusCode = statusCode;

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

/**
 * Represents an HTTP error thrown when a request's origin is not allowed by CORS policy.
 *
 * @remarks
 * This error is typically used to indicate that the origin of an incoming request
 * does not match the allowed origins specified by the server's CORS configuration.
 *
 * @extends HttpError
 *
 * @param origin - The origin string that was rejected, or `null`/`undefined` if not provided.
 *
 * @property origin - The origin that caused the error.
 */

export class CorsOriginError extends HttpError {
	public readonly origin: string | null | undefined;

	constructor(origin: string | null | undefined) {
		let msg: string;
		if (!origin) {
			msg = `${typeof origin}`;
		}

		if (origin === '') {
			msg = '';
		}

		msg = `Origin ${origin} not allowed by CORS`;

		super(msg, 'http', 'Invalid Cors', 200);
		this.origin = origin;
		this.name = 'CorsOriginError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CorsOriginError);
		}
	}
}

/**
 * Represents an HTTP error that occurs during the login process.
 *
 * @extends HttpError
 *
 * @param msg - The error message describing the login failure.
 * @param cause - The underlying cause of the error.
 * @param statusCode - The HTTP status code associated with the error.
 *
 * @example
 * throw new LoginError('Invalid credentials', 'User not found', 401);
 */

export class LoginError extends HttpError {
	constructor(msg: string, cause: string, statusCode: number) {
		super(msg, 'login', cause, statusCode);
		this.name = 'LoginError';

		Error.captureStackTrace(this, LoginError);
	}
}

/**
 * Represents an HTTP 401 Unauthorized error, typically thrown when authentication fails.
 *
 * @remarks
 * This error extends {@link LoginError} and sets the HTTP status code to 401.
 *
 * @example
 * ```typescript
 * throw new UnauthorizedError('Invalid credentials', { username: 'user1' });
 * ```
 *
 * @param msg - The error message. Defaults to 'Unauthorized'.
 * @param context - Optional additional context for the error.
 *
 * @property context - An optional object containing additional error context.
 */

export class UnauthorizedError extends LoginError {
	public readonly context?: Record<string, unknown>;

	constructor(msg: string = 'Unauthorized', context?: Record<string, unknown>) {
		super(msg, 'Unauthorized', 401);
		this.name = 'UnauthorizedError';
		this.context = context;

		Error.captureStackTrace(this, UnauthorizedError);
	}
}

/**
 * Represents a validation error that occurs during the login process.
 * Extends {@link LoginError} and includes an array of validation error messages.
 *
 * @remarks
 * This error is typically thrown when one or more validation checks fail during login.
 *
 * @example
 * ```typescript
 * throw new LoginValidationError('Invalid credentials', ['Email is required', 'Password is too short']);
 * ```
 *
 * @param msg - The error message describing the validation failure. Defaults to 'Validation failed'.
 * @param errors - An array of specific validation error messages. Defaults to an empty array.
 *
 * @property errors - The array of validation error messages.
 */

export class LoginValidationError extends LoginError {
	public readonly errors: string[];

	constructor(msg: string = 'Validation failed', errors: string[] = []) {
		super(msg, 'Validation failed', 400);
		this.name = 'ValidationError';
		this.errors = errors;

		Error.captureStackTrace(this, LoginValidationError);
	}
}

/**
 * Represents an HTTP error specific to OAuth operations.
 *
 * Extends the {@link HttpError} class to provide additional context for OAuth-related errors.
 *
 * @remarks
 * This error includes a custom name and captures the stack trace for debugging purposes.
 *
 * @param msg - The error message describing the issue.
 * @param cause - The underlying cause of the error.
 * @param statusCode - The HTTP status code associated with the error.
 */

export class OAuthError extends HttpError {
	constructor(msg: string, cause: string, statusCode: number) {
		super(msg, 'oauth', cause, statusCode);
		this.name = 'OauthError';

		Error.captureStackTrace(this, OAuthError);
	}
}

/**
 * Represents an OAuth validation error, typically thrown when a request fails validation checks.
 *
 * @extends OAuthError
 *
 * @param msg - The error message describing the validation failure.
 * @param cause - The underlying cause or reason for the validation error.
 *
 * @remarks
 * This error sets the HTTP status code to 400 (Bad Request) and captures the stack trace for debugging purposes.
 */

export class OAuthValidationError extends OAuthError {
	constructor(msg: string) {
		super(msg, 'Validation error', 400);
		this.name = 'OAuthValidationError';

		Error.captureStackTrace(this, OAuthValidationError);
	}
}

/**
 * Represents an OAuth-specific error indicating that the request is unauthorized.
 *
 * This error is typically thrown when authentication fails or the user does not have
 * the necessary permissions to access the requested resource.
 *
 * @extends OAuthError
 * @example
 * throw new OAuthUnAuthorizedError('Invalid access token');
 */

export class OAuthUnAuthorizedError extends OAuthError {
	constructor(msg: string) {
		super(msg, 'Unauthorized', 401);
		this.name = 'OAuthUnAuthorizedError';

		Error.captureStackTrace(this, OAuthUnAuthorizedError);
	}
}
