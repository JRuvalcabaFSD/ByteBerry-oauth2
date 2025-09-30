/**
 * Represents an error related to application configuration.
 *
 * This specialized error extends the built-in Error and includes a structured `context`
 * payload to aid debugging and logging of configuration issues.
 *
 * @extends Error
 * @public
 *
 * @remarks
 * - The `context` property contains arbitrary key/value pairs that describe the conditions
 *   under which the error occurred (e.g., missing keys, file paths, expected formats).
 * - The `name` property is set to the class name to improve error identification.
 *
 * @example
 * // Throwing with contextual metadata
 * throw new ConfigError('Missing environment variable', {
 *   key: 'DATABASE_URL',
 *   source: 'process.env'
 * });
 *
 * @example
 * // Handling and logging
 * try {
 *   validateConfig();
 * } catch (err) {
 *   if (err instanceof ConfigError) {
 *     logger.error(err.message, err.context);
 *   }
 * }
 */
export class ConfigError extends Error {
  public context: Record<string, unknown>;

  /**
   * Creates an instance of ConfigError.
   * @param {string} message
   * @param {Record<string, unknown>} context
   * @memberof ConfigError
   */
  constructor(message: string, context: Record<string, unknown>) {
    super(message);
    this.context = context;
    this.name = this.constructor.name;
  }
}
