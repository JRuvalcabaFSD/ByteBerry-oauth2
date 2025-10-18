import { Token } from '@/container';

/**
 * Represents an error thrown by the dependency injection container for a specific token.
 *
 * Extends the built-in Error to attach a Token to the error, allowing callers to identify
 * which binding or dependency caused the failure.
 *
 * @remarks
 * The ContainerError preserves standard Error properties (message, name, stack) and exposes
 * a readonly `token` property containing the Token associated with the failure. This is useful
 * for diagnostics, logging, and programmatic error handling when container operations fail.
 *
 * @param message - A human-readable description of the error.
 * @param token - The Token identifying the binding or dependency involved in the error.
 *
 * @example
 * ```ts
 * // Throwing a ContainerError when a dependency cannot be resolved:
 * throw new ContainerError('Unable to resolve dependency', myDependencyToken);
 * ```
 *
 * @public
 */

export class ContainerError extends Error {
  public readonly token: Token;
  constructor(message: string, token: Token) {
    super(message);
    this.name = 'ContainerError';
    this.token = token;
  }
}

/**
 * Error thrown when the container fails to create or resolve a service because the requested
 * Token has not been registered.
 *
 * Extends ContainerError and carries the offending Token so callers can identify which service
 * registration is missing.
 *
 * @extends ContainerError
 * @param token - The Token that was requested but is not registered in the container.
 */

export class ContainerCreationError extends ContainerError {
  constructor(token: Token) {
    super(`${token} service not registered`, token);
    this.name = 'ContainerCreationError';
  }
}

/**
 * Error thrown when an attempt is made to register a token that is already present in the container.
 *
 * This class extends {@link ContainerError} and carries the offending {@link Token} as contextual
 * information so callers can inspect which token caused the conflict.
 *
 * @param token - The token that was already registered in the container.
 *
 * @example
 * // Throws because the token was previously registered
 * throw new TokenAlreadyRegisteredError(MyToken);
 */

export class TokenAlreadyRegisteredError extends ContainerError {
  constructor(token: Token) {
    super(`Token '${token}' is already registered`, token);
    this.name = 'TokenAlreadyRegisteredError ';
  }
}

/**
 * Error thrown when attempting to use a Token that has not been registered with the container.
 *
 * This class represents a specific container-related error raised when a requested Token
 * cannot be found in the dependency container's registry. The error message includes the
 * token's representation to aid debugging.
 *
 * @extends ContainerError
 * @param token - The Token instance or identifier that is not registered in the container.
 * @example
 * // Thrown when resolving an unregistered token
 * throw new TokenNotRegisteredError(myToken);
 */

export class TokenNotRegisteredError extends ContainerError {
  constructor(token: Token) {
    super(`Token '${token}' is not registered`, token);
    this.name = 'TokenNotRegisteredError ';
  }
}

/**
 * Thrown when the dependency container detects a circular dependency between tokens.
 *
 * This class extends ContainerError and includes a readable description of the dependency
 * chain that formed the cycle. The message is built by appending the current token to the
 * provided dependencyChain and joining them with " -> " (for example: "A -> B -> C -> A").
 *
 * @param dependencyChain - The sequence of tokens visited before the current token; used to construct the cycle description.
 * @param currentToken - The token at which the cycle was detected and appended to the chain.
 *
 * @example
 * // Throws: "Circular dependency detected: A -> B -> A"
 * throw new CircularDependencyError(['A', 'B'], 'A');
 *
 * @extends ContainerError
 */

export class CircularDependencyError extends ContainerError {
  constructor(dependencyChain: string[], currentToken: Token) {
    const chain = [...dependencyChain, currentToken];
    const chainDescription = chain.map(t => t).join(' -> ');
    super(`Circular dependency detected: ${chainDescription}`, currentToken);
    this.name = 'CircularDependencyError';
  }
}
