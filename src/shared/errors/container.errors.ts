/**
 * Custom error classes for dependency injection container
 * @export
 * @class ContainerError
 * @extends {Error}
 */
export class ContainerError extends Error {
  public readonly token: symbol;

  /**
   * Creates an instance of ContainerError.
   * @param {string} message
   * @param {symbol} token
   * @memberof ContainerError
   */
  constructor(message: string, token: symbol) {
    super(message);
    this.name = this.constructor.name;
    this.token = token;
  }
}

/**
 * Error thrown when the container fails to create an instance of a service
 * @export
 * @class ContainerCreationError
 * @extends {ContainerError}
 */
export class ContainerCreationError extends ContainerError {
  constructor(token: symbol) {
    super(`${token.description} service not registered`, token);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when trying to register a token that is already registered
 * @export
 * @class TokenAlreadyRegisteredError
 * @extends {ContainerError}
 */
export class TokenAlreadyRegisteredError extends ContainerError {
  /**
   * Creates an instance of TokenAlreadyRegisteredError.
   * @param {symbol} token
   * @memberof TokenAlreadyRegisteredError
   */
  constructor(token: symbol) {
    super(`Token '${token.description || token.toString()}' is already registered`, token);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when trying to resolve a token that is not registered
 * @export
 * @class TokenNotRegisteredError
 * @extends {ContainerError}
 */
export class TokenNotRegisteredError extends ContainerError {
  /**
   * Creates an instance of TokenNotRegisteredError.
   * @param {symbol} token
   * @memberof TokenNotRegisteredError
   */
  constructor(token: symbol) {
    super(`Token '${token.description || token.toString()}' is not registered`, token);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when a circular dependency is detected
 * @export
 * @class CircularDependencyError
 * @extends {ContainerError}
 */
export class CircularDependencyError extends ContainerError {
  constructor(dependencyChain: symbol[], currentToken: symbol) {
    const chain = [...dependencyChain, currentToken];
    const chainDescription = chain.map(t => t.description || t.toString()).join(' -> ');
    super(`Circular dependency detected: ${chainDescription}`, currentToken);
    this.name = this.constructor.name;
  }
}
