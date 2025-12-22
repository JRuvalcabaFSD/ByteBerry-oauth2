/**
 * Represents the possible categories of errors that can occur within the domain layer.
 *
 * - `'bootstrap'`: Errors related to the application bootstrap process.
 * - `'config'`: Errors related to configuration issues.
 * - `'container'`: Errors related to dependency injection or service container.
 * - `'http'`: Errors related to HTTP requests or responses.
 * - `'oauth'`: Errors specific to OAuth authentication/authorization.
 * - `'domain'`: General domain-specific errors.
 */
export type ErrorType = 'bootstrap' | 'config' | 'container' | 'http' | 'oauth' | 'domain';

/**
 * Represents a custom application error with a specific error type.
 *
 * @extends Error
 * @remarks
 * This error class is used to encapsulate domain-specific errors within the application,
 * providing an additional `errorType` property to categorize the error.
 *
 * @example
 * ```typescript
 * throw new AppError('Invalid credentials', ErrorType.Authentication);
 * ```
 *
 * @param msg - The error message describing what went wrong.
 * @param type - The specific type of the error, represented by `ErrorType`.
 * @property errorType - The type/category of the error.
 */

export class AppError extends Error {
	public readonly errorType: ErrorType;
	constructor(msg: string, type: ErrorType) {
		super(msg);
		this.name = 'AppError';
		this.errorType = type;

		Error.captureStackTrace(this, AppError);
	}
}
