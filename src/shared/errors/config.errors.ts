import { AppError } from '@shared';

/**
 * Represents an error that occurs during application configuration.
 *
 * This error class extends {@link AppError} and is specifically designed to handle
 * configuration-related issues. It includes additional context information to help
 * diagnose configuration problems.
 *
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new ConfigError(
 *   'Invalid database configuration',
 *   { host: 'localhost', port: 3306, attempted: 'connection' }
 * );
 * ```
 */

export class ConfigError extends AppError {
	public context: Record<string, unknown>;

	/**
	 * Creates a new ConfigError instance.
	 *
	 * @param message - The error message describing what went wrong with the configuration
	 * @param context - Additional context information about the error as key-value pairs
	 */
	constructor(message: string, context: Record<string, unknown>) {
		super(message, 'config');
		this.context = context;
		this.name = 'ConfigError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConfigError);
		}
	}
}
