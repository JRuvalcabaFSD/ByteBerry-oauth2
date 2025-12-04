import { Token } from '@container';

/**
 * Error thrown when a container operation fails.
 *
 * @remarks
 * This error is specific to dependency injection container operations and includes
 * information about the token that caused the error.
 *
 * @example
 * ```typescript
 * throw new ContainerError('Service not found', MyServiceToken);
 * ```
 */

export class ContainerError extends Error {
	public readonly errorType = 'container';
	public readonly token: Token;
	constructor(message: string, token: Token) {
		super(message);
		this.name = 'ContainerError';
		this.token = token;
	}
}

/**
 * Error thrown when attempting to create or retrieve a service from the container
 * that has not been registered.
 *
 * @remarks
 * This error is thrown during dependency injection when the container cannot
 * instantiate a service because its token has not been registered in the container.
 *
 * @example
 * ```typescript
 * throw new ContainerCreationError(MyServiceToken);
 * ```
 */

export class ContainerCreationError extends ContainerError {
	constructor(token: Token) {
		super(`${token} service not registered`, token);
		this.name = 'ContainerCreationError';
	}
}

/**
 * Error thrown when attempting to register a token that is already registered in the container.
 *
 * @remarks
 * This error extends {@link ContainerError} and is typically thrown during dependency injection
 * container configuration when a duplicate token registration is detected.
 *
 * @example
 * ```typescript
 * throw new TokenAlreadyRegisteredError(myToken);
 * ```
 */

export class TokenAlreadyRegisteredError extends ContainerError {
	constructor(token: Token) {
		super(`Token '${token}' is already registered`, token);
		this.name = 'TokenAlreadyRegisteredError';
	}
}

/**
 * Error thrown when attempting to resolve a token that has not been registered in the container.
 *
 * @extends ContainerError
 *
 * @example
 * ```typescript
 * throw new TokenNotRegisteredError(myToken);
 * ```
 */
export class TokenNotRegisteredError extends ContainerError {
	constructor(token: Token) {
		super(`Token '${token}' is not registered`, token);
		this.name = 'TokenNotRegisteredError';
	}
}

/**
 * Error thrown when a circular dependency is detected in the dependency injection container.
 *
 * A circular dependency occurs when a service depends on itself either directly or indirectly
 * through a chain of dependencies (e.g., A depends on B, B depends on C, and C depends on A).
 *
 * @extends ContainerError
 *
 * @example
 * ```typescript
 * // If ServiceA -> ServiceB -> ServiceC -> ServiceA
 * throw new CircularDependencyError(
 *   [tokenA, tokenB, tokenC],
 *   tokenA
 * );
 * // Error message: "Circular dependency detected: TokenA -> TokenB -> TokenC -> TokenA"
 * ```
 */

export class CircularDependencyError extends ContainerError {
	constructor(dependencyChain: string[], currentToken: Token) {
		const chain = [...dependencyChain, currentToken];
		const chainDescription = chain.map((t) => t).join(' -> ');
		super(`Circular dependency detected: ${chainDescription}`, currentToken);
		this.name = 'CircularDependencyError';
	}
}
