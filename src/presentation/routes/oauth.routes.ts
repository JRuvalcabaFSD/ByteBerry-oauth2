import { AuthorizationController, TokenController } from '@presentation';
import { Router } from 'express';

//TODO documentar
export function createOauth2Routes(authController: AuthorizationController, tokenController: TokenController): Router {
	const router = Router();
	router.get('/authorize', authController.handle);
	router.post('/token', tokenController.handle);
	return router;
}
