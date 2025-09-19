/**
 * Base error class for DI Container related errors
 * @export
 * @abstract
 * @class ContainerError
 * @extends {Error}
 */
export abstract class ContainerError extends Error {
  public readonly name: string;
  public readonly timestamp: Date;

  constructor(message: string, name: string) {
    super(message);
    this.name = name;
    this.timestamp = new Date();

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when attempting to register a token that already exists
 * @export
 * @class TokenAlreadyRegisterError
 * @extends {ContainerError}
 */
export class TokenAlreadyRegisteredError extends ContainerError {
  public readonly token: symbol;

  constructor(token: symbol) {
    const message = `Token '${token.toString()}' is already registered in the container`;
    super(message, 'TokenAlreadyRegisteredError');
    this.token = token;
  }
}

/**
 * Error thrown when attempting to resolve a token that is not registered
 * @export
 * @class TokenAlreadyRegisterError
 * @extends {ContainerError}
 */
export class TokenNotRegisteredError extends ContainerError {
  public readonly token: symbol;

  constructor(token: symbol) {
    const message = `Token '${token.toString()}' is not registered in the container`;
    super(message, 'TokenNotRegisteredError');
    this.token = token;
  }
}

/**
 * Error thrown when a circular dependency is detected during resolution
 * @export
 * @class CircularDependencyError
 * @extends {ContainerError}
 */
export class CircularDependencyError extends ContainerError {
  public readonly dependencyChain: symbol[];
  public readonly conflictingToken: symbol;

  constructor(dependencyChain: symbol[], conflictingToken: symbol) {
    const chainStr = dependencyChain.map(token => token.toString()).join(' -> ');
    const message = `Circular dependency detected: ${chainStr} -> ${conflictingToken.toString()}`;
    super(message, 'CircularDependencyError');
    this.dependencyChain = [...dependencyChain];
    this.conflictingToken = conflictingToken;
  }
}

/**
 * Error thrown when factory function fails during dependency creation
 * @export
 * @class DependencyCreationError
 * @extends {ContainerError}
 */
export class DependencyCreationError extends ContainerError {
  public readonly token: symbol;
  public readonly originalError: Error;

  constructor(token: symbol, originalError: Error) {
    const message = `Failed to create dependency for token '${token.toString()}': ${originalError.message}`;
    super(message, 'DependencyCreationError');
    this.token = token;
    this.originalError = originalError;
  }
}
