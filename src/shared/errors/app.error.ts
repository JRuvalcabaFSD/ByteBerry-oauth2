/**
 * Defines the type of error that occurred within the application.
 *
 * @remarks
 * This union type categorizes errors into different domains to help with error handling and logging.
 *
 * - `bootstrap`: Errors that occur during application initialization
 * - `config`: Errors related to configuration loading or validation
 * - `container`: Errors related to dependency injection or service container
 * - `http`: Errors related to HTTP requests or responses
 */

export type ErrorType = 'bootstrap' | 'config' | 'container' | 'http' | 'oauth';

/**
 * Custom application error class that extends the native Error class.
 *
 * @remarks
 * This class provides a way to create application-specific errors with a type classification.
 * It properly captures stack traces and sets the error name for better debugging.
 *
 * @example
 * ```typescript
 * throw new AppError('User not found', ErrorType.NOT_FOUND);
 * ```
 *
 * @public
 */

export class AppError extends Error {
	public readonly errorType: ErrorType;
	constructor(message: string, type: ErrorType) {
		super(message);
		this.errorType = type;
		this.name = 'AppError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}
	}
}
