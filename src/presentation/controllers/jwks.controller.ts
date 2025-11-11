import { GetJwksUseCase } from '@/application';
import { Request, Response, NextFunction } from 'express';

/**
 * Controller responsible for handling requests to retrieve the JSON Web Key Set (JWKS).
 *
 * @remarks
 * This controller exposes an endpoint that returns the public keys used for JWT signature verification.
 * The JWKS response is cached for 1 hour to optimize performance.
 *
 * @example
 * // Usage in an Express route
 * app.get('/.well-known/jwks.json', jwksController.handle);
 *
 * @public
 */

export class JWksController {
  /**
   * Creates an instance of the controller with the provided GetJwksUseCase dependency.
   * @param getJwksUseCase - The use case responsible for retrieving JSON Web Key Sets (JWKS).
   */

  constructor(private readonly getJwksUseCase: GetJwksUseCase) {}

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
      const jwks = await this.getJwksUseCase.execute();

      res.set({ 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' });
      res.json(jwks);
    } catch (error) {
      next(error);
    }
  };
}
