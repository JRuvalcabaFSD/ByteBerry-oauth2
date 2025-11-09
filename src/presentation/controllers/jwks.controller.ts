import { Request, Response, NextFunction } from 'express';

/**
 * Controller responsible for handling JSON Web Key Set (JWKS) endpoints.
 *
 * @remarks
 * This controller provides public keys used for verifying JWT signatures.
 * The JWKS endpoint is typically used by OAuth 2.0 and OpenID Connect clients
 * to retrieve the server's public keys for token verification.
 *
 * @example
 * ```typescript
 * const jwksController = new JWksController();
 * app.get('/.well-known/jwks.json', jwksController.handle);
 * ```
 */

export class JWksController {
  constructor() {}

  /**
   * Handles HTTP requests to retrieve the JSON Web Key Set (JWKS).
   *
   * This endpoint returns the public keys used to verify JWT signatures.
   * The response is cached for 1 hour (3600 seconds) to improve performance.
   *
   * @param _req - The Express request object (unused)
   * @param res - The Express response object used to send the JWKS
   * @param next - The Express next function for error handling
   * @returns A promise that resolves when the response is sent
   *
   * @remarks
   * Currently returns a mock JWKS with a single RSA key.
   * The mock key uses RS256 algorithm for JWT signing.
   *
   * @throws Passes any errors to the Express error handler via next()
   */

  public handle = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mockJWks = {
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            kid: 'mock-key-id',
            alg: 'RS256',
            n: 'mock-modulus',
            e: 'AQAB',
          },
        ],
      };

      res.set('Cache-Control', 'public, max-age=3600');
      res.json(mockJWks);
    } catch (error) {
      next(error);
    }
  };
}
