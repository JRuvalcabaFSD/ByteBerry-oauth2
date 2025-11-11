/**
 * Custom error class for configuration-related errors.
 *
 * This error extends the base Error class and provides additional context
 * information about the configuration failure. It's typically thrown when
 * there are issues with application configuration, such as missing required
 * settings, invalid configuration values, or configuration validation failures.
 *
 * @example
 * ```typescript
 * throw new ConfigError('Invalid OAuth client ID', {
 *   clientId: 'abc123',
 *   expectedFormat: 'UUID'
 * });
 * ```
 */

export class ConfigError extends Error {
  public readonly errorType = 'config';
  public context: Record<string, unknown>;

  constructor(message: string, context: Record<string, unknown>) {
    super(message);
    this.context = context;
    this.name = 'ConfigError';
  }
}
