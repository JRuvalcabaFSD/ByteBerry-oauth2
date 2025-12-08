import { AuthorizationController } from '@presentation';
import { Router } from 'express';

//TODO documentar
export function createOauth2Routes(authController: AuthorizationController): Router {
	const router = Router();
	router.get('/Authorize', authController.handle);
	return router;
}
