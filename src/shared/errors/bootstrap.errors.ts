/**
 * Custom error class for bootstrap-related errors.
 *
 * This error type is used to capture and report errors that occur during the
 * application bootstrap process, providing additional context information.
 *
 * @extends Error
 *
 * @property {string} erroType - The type identifier for this error, always set to 'bootstrap'
 * @property {Record<string, unknown>} context - Additional contextual information about the error
 *
 * @example
 * ```typescript
 * throw new BootstrapError(
 *   'Failed to initialize database connection',
 *   { database: 'postgres', host: 'localhost', port: 5432 }
 * );
 * ```
 */

export class BootstrapError extends Error {
	public readonly erroType = 'bootstrap';
	public readonly context: Record<string, unknown>;

	/**
	 * Creates a new BootstrapError instance.
	 *
	 * @param message - The error message describing what went wrong during bootstrap
	 * @param context - Additional contextual information about the error as key-value pairs
	 */

	constructor(message: string, context: Record<string, unknown>) {
		super(message);
		this.name = 'BootstrapError';
		this.context = context;
	}
}
