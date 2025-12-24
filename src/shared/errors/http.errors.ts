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
 * Represents an HTTP 401 Unauthorized error.
 *
 * This error is typically thrown when authentication is required and has failed or has not yet been provided.
 *
 * @extends HttpError
 * @property {Record<string, unknown>=} context - Optional additional context for the error.
 * @example
 * throw new UnauthorizedError('Invalid token', { token: 'abc123' });
 */

export class UnauthorizedError extends HttpError {
	public readonly context?: Record<string, unknown>;

	constructor(msg: string = 'Unauthorized', context?: Record<string, unknown>) {
		super(msg, 'login', 'Unauthorized', 401);
		this.name = 'UnauthorizedError';
		this.context = context;

		Error.captureStackTrace(this, UnauthorizedError);
	}
}

/**
 * Represents an HTTP 400 validation error.
 *
 * Extends the {@link HttpError} class to provide additional context for validation failures,
 * including a list of error messages and optional contextual information.
 *
 * @example
 * ```typescript
 * throw new ValidationError('Invalid input', ['email is required'], { field: 'email' });
 * ```
 *
 * @extends HttpError
 *
 * @property errors - An array of validation error messages.
 * @property context - Optional additional context for the validation error.
 */

export class LoginValidationError extends HttpError {
	public readonly errors: string[];

	constructor(msg: string = 'Validation failed', errors: string[] = []) {
		super(msg, 'login', 'Validation failed', 400);
		this.name = 'ValidationError';
		this.errors = errors;

		Error.captureStackTrace(this, LoginValidationError);
	}
}
