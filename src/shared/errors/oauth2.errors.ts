/**
 * Represents an OAuth 2.0 error as defined in RFC 6749.
 *
 * This error class encapsulates OAuth 2.0 protocol errors with standard error codes,
 * descriptions, and HTTP status codes. It extends the base Error class and provides
 * a JSON serialization method for API responses.
 *
 * @extends Error
 *
 * @example
 * ```typescript
 * throw new OAuth2Error(
 *   'invalid_request',
 *   'The request is missing a required parameter',
 *   400
 * );
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 | RFC 6749 Section 5.2}
 */

export class OAuth2Error extends Error {
  public readonly errorType = 'oauth';

  /**
   * Creates an instance of OAuth2Error.
   *
   * @param error - The OAuth2 error code as defined in RFC 6749
   * @param errorDescription - A human-readable description of the error
   * @param statusCode - The HTTP status code associated with the error (defaults to 400)
   */

  constructor(
    public readonly error: string,
    public readonly errorDescription: string,
    public readonly statusCode: number = 400
  ) {
    super(errorDescription);
    this.name = 'OAuth2Error';
  }

  /**
   * Converts the OAuth2 error to a JSON representation.
   *
   * @returns An object containing the error code and error description.
   * The returned object has two properties:
   * - `error`: The error code
   * - `error_descriptor`: The human-readable error description
   */

  toJSON() {
    return {
      error: this.error,
      error_descriptor: this.errorDescription,
    };
  }
}

/**
 * Represents an OAuth2 invalid request error.
 *
 * This error is thrown when the request is missing a required parameter,
 * includes an invalid parameter value, includes a parameter more than once,
 * or is otherwise malformed.
 *
 * @extends OAuth2Error
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 | RFC 6749 Section 5.2}
 */

export class InvalidRequestError extends OAuth2Error {
  /**
   * Creates an instance of the InvalidRequest error.
   *
   * @param description - A human-readable description of the error that occurred
   */

  constructor(description: string) {
    super('invalid_request', description, 400);
  }
}

/**
 * Error thrown when client authentication fails during OAuth2 operations.
 *
 * This error represents an OAuth2 `invalid_client` error as defined in RFC 6749.
 * It is typically thrown when:
 * - Client credentials are invalid or missing
 * - Client authentication fails
 * - The authenticated client is not authorized to use the requested grant type
 *
 * @remarks
 * This error results in an HTTP 401 (Unauthorized) status code.
 *
 * @example
 * ```typescript
 * throw new InvalidClientError('Invalid client credentials provided');
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 | RFC 6749 Section 5.2}
 */

export class InvalidClientError extends OAuth2Error {
  /**
   * Creates an instance of the InvalidRequest error.
   *
   * @param description - A human-readable description of the error that occurred
   */
  constructor(description: string = 'Client authentication failed') {
    super('invalid_client', description, 401);
  }
}

/**
 * Error thrown when an authorization grant is invalid, expired, revoked, does not match
 * the redirection URI used in the authorization request, or was issued to another client.
 *
 * This error corresponds to the OAuth 2.0 'invalid_grant' error code as defined in
 * RFC 6749 Section 5.2.
 *
 * @extends OAuth2Error
 *
 * @example
 * ```typescript
 * throw new InvalidGrantError('The authorization code has expired');
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 | RFC 6749 Section 5.2}
 */

export class InvalidGrantError extends OAuth2Error {
  /**
   * Creates an instance of the InvalidRequest error.
   *
   * @param description - A human-readable description of the error that occurred
   */

  constructor(description: string = 'Invalid authorization grant') {
    super('invalid_grant', description, 400);
  }
}

/**
 * Represents an OAuth2 error that occurs when a client is not authorized to perform a requested operation.
 *
 * This error is thrown when the authenticated client is not authorized to use the requested
 * authorization grant type or otherwise lacks the necessary permissions.
 *
 * @extends OAuth2Error
 *
 * @example
 * ```typescript
 * throw new UnauthorizedClientError('Client is not authorized to use this grant type');
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1 | RFC 6749 Section 4.1.2.1}
 */

export class UnauthorizedClientError extends OAuth2Error {
  /**
   * Creates an instance of the InvalidRequest error.
   *
   * @param description - A human-readable description of the error that occurred
   */

  constructor(description: string = 'Client not authorized') {
    super('unauthorized_client', description, 401);
  }
}

/**
 * Error thrown when the authorization grant type is not supported by the authorization server.
 *
 * @remarks
 * This error indicates that the authorization grant type provided in the request is not
 * recognized or supported by the OAuth 2.0 server. The client should not retry the request
 * with the same grant type.
 *
 * @example
 * ```typescript
 * throw new UnsupportedGrantTypeError('The "implicit" grant type is not supported');
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-5.2 | RFC 6749 Section 5.2}
 */

export class UnsupportedGrantTypeError extends OAuth2Error {
  /**
   * Creates an instance of the InvalidRequest error.
   *
   * @param description - A human-readable description of the error that occurred
   */

  constructor(description: string = 'Grant type not supported') {
    super('unsupported_grant_type', description, 400);
  }
}
