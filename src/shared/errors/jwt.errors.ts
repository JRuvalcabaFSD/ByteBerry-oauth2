/**
 * Error type representing failures related to JSON Web Tokens (JWT), such as
 * missing tokens, invalid signatures, expired tokens, or malformed payloads.
 *
 * The error name is set to "JwtError", and when supported by the runtime, a
 * clean stack trace is captured starting at the constructor for clearer debugging.
 *
 * @example
 * // Throw when a JWT is missing or invalid
 * throw new JwtError('Invalid or missing JWT');
 *
 * @extends Error
 * @public
 */

export class JwtError extends Error {
  /**
   * Creates an instance of JwtError.
   * @param {string} message
   * @memberof JwtError
   */
  constructor(message: string) {
    super(message);
    this.name = 'JwtError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when JWT token generation fails.
 *
 * This error extends JwtError and is specifically used to indicate
 * failures during the JWT creation process, such as invalid payload,
 * missing or invalid signing key, or other generation-related issues.
 *
 * @example
 * ```typescript
 * throw new JwtGenerationError("Invalid signing key", originalError);
 * ```
 */

export class JwtGenerationError extends JwtError {
  /**
   * Creates an instance of JwtGenerationError.
   * @param {string} message
   * @param {Error} [cause]
   * @memberof JwtGenerationError
   */
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(`JWT generation failed: ${message}`);
    this.name = 'JwtGenerationError';
  }
}

/**
 * Error thrown when JWT verification fails.
 *
 * This error is thrown when a JWT token cannot be verified due to issues such as:
 * - Invalid signature
 * - Expired token
 * - Malformed token structure
 * - Missing or invalid claims
 *
 * @extends JwtError
 *
 * @example
 * ```typescript
 * throw new JwtVerificationError('Token has expired', originalError);
 * ```
 */

export class JwtVerificationError extends JwtError {
  /**
   * Creates an instance of JwtVerificationError.
   * @param {string} message
   * @param {Error} [cause]
   * @memberof JwtVerificationError
   */
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(`JWT verification failed: ${message}`);
    this.name = 'JwtVerificationError';
  }
}

/**
 * Error thrown when a JSON Web Token (JWT) is misconfigured or its required
 * settings are invalid or missing.
 *
 * This error is intended for configuration-time issues (e.g., startup or initialization),
 * such as:
 * - Missing or empty secrets/keys
 * - Unsupported or unspecified algorithms
 * - Invalid issuer/audience values
 * - Misconfigured token lifetimes (exp, nbf)
 *
 * The message is automatically prefixed with "JWT configuration error:" and the
 * error name is set to "JwtConfigurationError" for easier identification.
 *
 * @example
 * throw new JwtConfigurationError("Missing JWT_SECRET environment variable");
 *
 * @public
 * @extends JwtError
 */

export class JwtConfigurationError extends JwtError {
  /**
   * Creates an instance of JwtConfigurationError.
   * @param {string} message
   * @memberof JwtConfigurationError
   */
  constructor(message: string) {
    super(`JWT configuration error: ${message}`);
    this.name = 'JwtConfigurationError';
  }
}
