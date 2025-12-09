import { AuthorizationController, JwksController, TokenController } from '@presentation';
import { Router } from 'express';

/**
 * Creates and configures OAuth2-related routes for the application.
 *
 * @param authController - Controller responsible for handling authorization requests.
 * @param tokenController - Controller responsible for handling token issuance requests.
 * @param jwksController - Controller responsible for serving the JSON Web Key Set (JWKS).
 * @returns An Express Router instance with OAuth2 endpoints configured:
 *   - `GET /authorize`: Handles authorization requests.
 *   - `POST /token`: Handles token requests.
 *   - `POST /.well-known/jwks.json`: Serves the JWKS for public key discovery.
 */

export function createOauth2Routes(
	authController: AuthorizationController,
	tokenController: TokenController,
	jwksController: JwksController
): Router {
	const router = Router();
	router.get('/authorize', authController.handle);
	router.post('/token', tokenController.handle);
	router.get('/.well-known/jwks.json', jwksController.handle);
	return router;
}
