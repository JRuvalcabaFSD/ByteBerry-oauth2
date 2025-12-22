import { AppError } from '@domain';

/**
 * Represents an error that occurs during the bootstrap process of the application.
 * Extends the {@link AppError} class and allows for additional contextual information.
 *
 * @example
 * ```typescript
 * throw new BootstrapError('Failed to initialize database', { dbHost: 'localhost' });
 * ```
 *
 * @extends AppError
 * @property {Record<string, unknown> | undefined} context - Optional contextual information about the error.
 */

export class BootstrapError extends AppError {
	public readonly context?: Record<string, unknown>;
	constructor(msg: string, context?: Record<string, unknown>) {
		super(msg, 'bootstrap');
		this.name = 'BootstrapError';
		this.context = context ?? undefined;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, BootstrapError);
		}
	}
}
