import { Router } from 'express';

import { createSessionMiddleware } from '@infrastructure';
import { IContainer } from '@interfaces';

//TODO documentar
export function createAuthRoutes(c: IContainer): Router {
	const router = Router();

	const loginController = c.resolve('LoginController');
	const authCodeController = c.resolve('AuthCodeController');
	const tokenController = c.resolve('TokenController');

	const requireSession = createSessionMiddleware(c.resolve('SessionRepository'), c.resolve('Logger'));

	router.get('/login', loginController.getLoginForm);
	router.post('/login', loginController.login);
	router.get('/authorize', requireSession, authCodeController.handle);
	router.post('/token', tokenController.handle);

	return router;
}
