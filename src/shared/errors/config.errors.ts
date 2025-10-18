/**
 * Error thrown when application configuration is invalid or missing required values.
 *
 * Extends the built-in Error to carry a structured `context` object with
 * additional diagnostic information (for example, which key or environment
 * triggered the error).
 *
 * @extends Error
 *
 * @param message - A human-readable description of the configuration error.
 * @param context - A record providing extra details about the error (keys are
 *   strings, values are any relevant diagnostic data).
 *
 * @property context - Additional context about the configuration issue.
 *
 * @example
 * const err = new ConfigError('Missing DB_HOST', { env: 'production', key: 'DB_HOST' });
 */

export class ConfigError extends Error {
  public context: Record<string, unknown>;

  constructor(message: string, context: Record<string, unknown>) {
    super(message);
    this.context = context;
    this.name = 'ConfigError';
  }
}
