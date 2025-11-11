import { Router } from 'express';

import { AuthorizeController, JWksController, TokenController } from '@/presentation';

/**
 * Creates and configures the OAuth2 router with the necessary endpoints.
 *
 * @param authorizeController - Controller responsible for handling authorization requests
 * @param tokenController - Controller responsible for handling token requests
 * @param jwksController - Controller responsible for handling JSON Web Key Set requests
 * @returns A configured Express Router instance with OAuth2 endpoints:
 *          - GET /authorize - Authorization endpoint
 *          - GET /token - Token endpoint
 *          - GET /.well-known/jwks.json - JWKS endpoint
 */

export function createOAuth2Routes(
  authorizeController: AuthorizeController,
  tokenController: TokenController,
  jwksController: JWksController
): Router {
  const router = Router();
  router.get('/authorize', authorizeController.handle);
  router.post('/token', tokenController.handle);
  router.get('/.well-known/jwks.json', jwksController.handle);
  return router;
}
