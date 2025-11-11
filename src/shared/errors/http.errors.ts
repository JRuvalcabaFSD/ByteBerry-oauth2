/**
 * Error thrown when a request origin is not allowed by CORS policy.
 *
 * @remarks
 * This error is typically thrown during CORS validation when an incoming request
 * originates from a domain that is not included in the list of allowed origins.
 *
 * @example
 * ```typescript
 * throw new CorsOriginsError('https://unauthorized-domain.com');
 * ```
 */

export class CorsOriginsError extends Error {
  public readonly errorType = 'cors';
  public readonly origin: string;
  constructor(origin: string) {
    super(`Origin ${origin} not allowed by CORS`);
    this.origin = origin;
    this.name = 'CorsOriginsError';
    this.stack = '';
  }
}
