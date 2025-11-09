/**
 * Custom error class for handling bootstrap-related errors.
 * @export
 * @class BootstrapError
 * @extends {Error}
 */
export class BootstrapError extends Error {
  public readonly errorType = 'bootstrap';
  public readonly context: Record<string, unknown>;
  /**
   * Creates an instance of BootstrapError.
   * @param {string} message
   * @param {Record<string, unknown>} context
   * @memberof BootstrapError
   */
  constructor(message: string, context: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BootstrapError);
    }
  }
}

/**
 * Error thrown when a required service is not registered in the container.
 * @export
 * @class ContainerCreationError
 * @extends {BootstrapError}
 */
export class ContainerBootstrapCreationError extends BootstrapError {
  /**
   * Creates an instance of ContainerBootstrapCreationError.
   * @param {symbol} token
   * @param {Error} [originalError]
   * @memberof ContainerBootstrapCreationError
   */
  constructor(token: symbol, originalError?: Error) {
    super(`Failed to create container: required service '${token.description || token.toString()}' not registered`, {
      tokenDescription: token.description,
      originalError: originalError?.message,
    });

    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when the application fails to start up properly.
 * @export
 * @class ShutdownError
 * @extends {BootstrapError}
 */
export class ShutdownError extends BootstrapError {
  /**
   * Creates an instance of ShutdownError.
   * @param {string} message
   * @param {Record<string, unknown>} [context={}]
   * @memberof ShutdownError
   */
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(`Shutdown failed: ${message}`, context);
    this.name = this.constructor.name;
  }
}
