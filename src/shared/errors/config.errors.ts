import { AppError } from '@domain';

/**
 * Represents an error related to application configuration.
 * Extends the {@link AppError} class and includes additional context information.
 *
 * @example
 * ```typescript
 * throw new ConfigError('Missing environment variable', { variable: 'DATABASE_URL' });
 * ```
 *
 * @param msg - The error message describing the configuration issue.
 * @param context - An object containing additional context about the error.
 */

export class ConfigError extends AppError {
	public readonly context?: Record<string, unknown>;

	constructor(msg: string, context?: Record<string, unknown>) {
		super(msg, 'config');
		this.context = context ?? undefined;
		this.name = 'ConfigError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ConfigError);
		}
	}
}
