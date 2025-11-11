/**
 * Represents an error thrown when a JWT token is invalid.
 *
 * @remarks
 * This error is used to indicate issues related to JWT validation, such as malformed tokens or signature verification failures.
 *
 * @example
 * ```typescript
 * throw new InvalidTokenError('Token is expired', 401);
 * ```
 *
 * @param message - A descriptive error message explaining the reason for the invalid token.
 * @param statusCode - The HTTP status code associated with the error.
 *
 * @property errorType - The type of error, always set to `'jwt'`.
 * @property statusCode - The HTTP status code associated with the error.
 */

export class InvalidTokenError extends Error {
  public readonly errorType = 'jwt';

  /**
   * Creates an instance of InvalidTokenError.
   *
   * @param message - The error message describing the invalid token.
   * @param statusCode - The HTTP status code associated with the error.
   */

  constructor(
    message: string,
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
