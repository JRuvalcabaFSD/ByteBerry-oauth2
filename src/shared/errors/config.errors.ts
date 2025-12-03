/**
 * Custom error class for configuration-related errors.
 *
 * @remarks
 * This error is thrown when there are issues with application configuration,
 * such as missing required values, invalid formats, or validation failures.
 *
 * @example
 * ```typescript
 * throw new ConfigError('Missing API key', { configFile: 'config.json' });
 * ```
 *
 * @public
 */

export class ConfigError extends Error {
	public readonly errorType = 'config';
	public context: Record<string, unknown>;

	/**
	 * Creates a new ConfigError instance.
	 *
	 * @param message - The error message describing what went wrong with the configuration
	 * @param context - Additional context information about the error as key-value pairs
	 */
	constructor(message: string, context: Record<string, unknown>) {
		super(message);
		this.context = context;
		this.name = 'ConfigError';
	}
}
