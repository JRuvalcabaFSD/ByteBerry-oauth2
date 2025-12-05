import { Router } from 'express';

export function createAppRouter(): Router {
	const router = Router();
	router.get('/', (req, res) => {
		res.json({ ok: 'Hola Mundo' });
	});
	return router;
}
