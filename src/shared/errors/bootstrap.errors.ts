import { AppError } from '@shared';

/**
 * Custom error class for bootstrap-related failures in the application.
 *
 * This error is thrown when critical initialization or startup processes fail,
 * such as configuration loading, dependency injection setup, or service initialization.
 * It extends AppError and includes additional context information to help diagnose
 * bootstrap issues.
 *
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new BootstrapError(
 *   'Failed to initialize database connection',
 *   { host: 'localhost', port: 5432, error: 'Connection timeout' }
 * );
 * ```
 */

export class BootstrapError extends AppError {
	public readonly context: Record<string, unknown>;

	/**
	 * Creates a new BootstrapError instance.
	 *
	 * @param message - The error message describing what went wrong during bootstrap
	 * @param context - Additional contextual information about the error as key-value pairs
	 */

	constructor(message: string, context: Record<string, unknown>) {
		super(message, 'bootstrap');
		this.name = 'BootstrapError';
		this.context = context;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BootstrapError);
		}
	}
}
