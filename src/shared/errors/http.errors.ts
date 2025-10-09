/**
 * Represents a generic HTTP error with a status code.
 *
 * Extends the built-in `Error` class to include an HTTP status code,
 * allowing for more descriptive error handling in HTTP-based applications.
 *
 * @example
 * ```typescript
 * throw new HttpError('Not Found', 404);
 * ```
 *
 * @remarks
 * The `statusCode` property indicates the HTTP status code associated with the error.
 *
 * @param message - A descriptive error message.
 * @param statusCode - The HTTP status code corresponding to the error.
 */

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, HttpError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Represents an HTTP 400 Bad Request error.
 *
 * This error should be thrown when the server cannot process the request due to a client error
 * (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
 *
 * @extends HttpError
 * @example
 * throw new BadRequestError('Invalid input data');
 */

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BadRequestError';
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Represents an HTTP 401 Unauthorized error.
 *
 * This error should be thrown when a request lacks valid authentication credentials
 * for the target resource.
 *
 * @extends HttpError
 * @example
 * throw new UnauthorizedError('Authentication required');
 */

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Represents an HTTP 403 Forbidden error.
 *
 * This error should be thrown when a user attempts to access a resource
 * or perform an action for which they do not have sufficient permissions.
 *
 * @extends HttpError
 * @example
 * throw new ForbiddenError('You do not have access to this resource.');
 */

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Represents an HTTP 404 Not Found error.
 *
 * This error should be thrown when a requested resource cannot be found.
 * Inherits from {@link HttpError} and sets the HTTP status code to 404.
 *
 * @example
 * throw new NotFoundError('User not found');
 *
 * @param message - A descriptive error message explaining what was not found.
 */

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Represents an HTTP 500 Internal Server Error.
 *
 * This error should be thrown when an unexpected condition is encountered
 * and no more specific message is suitable. It extends the base `HttpError`
 * class and sets the HTTP status code to 500.
 *
 * @example
 * throw new InternalServerError('Something went wrong');
 *
 * @extends HttpError
 */

export class InternalServerError extends HttpError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
