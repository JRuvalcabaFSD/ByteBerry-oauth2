import { LoginController } from '@presentation';
import { Router } from 'express';

//TODO documentar
export function createAuthRoutes(controller: LoginController): Router {
	const router = Router();

	router.get('/login', controller.getLoginForm);
	router.post('/login', controller.login);
	return router;
}
