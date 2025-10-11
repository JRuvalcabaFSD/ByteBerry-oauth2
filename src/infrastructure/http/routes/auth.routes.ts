import { Router } from 'express';

import { IAuthController } from '@/interfaces';

/**
 * Creates and configures authentication routes for OAuth2 endpoints.
 *
 * This function sets up the standard OAuth2 routes including authorization,
 * token exchange, and JWKS (JSON Web Key Set) endpoints for public key discovery.
 *
 * @param controller - The authentication controller that handles the business logic
 *                    for OAuth2 operations including authorization, token generation,
 *                    and JWKS responses
 * @returns A configured Express Router instance with the following routes:
 *          - GET /authorize - OAuth2 authorization endpoint
 *          - POST /token - OAuth2 token exchange endpoint
 *          - GET /jwks.json - JWKS endpoint for public key discovery
 *          - GET /.well-known/jwks.json - Standard JWKS well-known endpoint
 *
 * @example
 * ```typescript
 * const authController = new AuthController();
 * const authRoutes = createAuthRoutes(authController);
 * app.use('/auth', authRoutes);
 * ```
 */

export function createAuthRoutes(controller: IAuthController): Router {
  const router = Router();

  router.get('/authorize', controller.authorize);
  router.post('/token', controller.token);
  router.get('/jwks.json', controller.jwks);
  router.get('/.well-known/jwks.json', controller.jwks);

  return router;
}
