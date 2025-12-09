import { IContainer } from '@interfaces';
import { Router, Request, Response } from 'express';
import { HomeResponse } from 'src/interfaces/http/http-request.interface.js';
import { createHeathRouter } from './health.routes.js';
import { createOauth2Routes } from './oauth.routes.js';

export function createAppRouter(c: IContainer): Router {
	const router = Router();

	// obtenemos los servicios necesarios
	const config = c.resolve('Config');
	const clock = c.resolve('Clock');
	const healthService = c.resolve('HealthService');

	//OAuth2 routes
	router.use('/', createOauth2Routes(c.resolve('AuthController'), c.resolve('TokenController')));

	//Health router
	router.use('/health', createHeathRouter(healthService));

	//Home route
	router.get('/', (req: Request, res: Response) => {
		const homeResponse: HomeResponse = {
			service: config.serviceName,
			version: config.version,
			status: 'running',
			timestamp: clock.isoString(),
			requestId: req.requestId,
			environment: config.nodeEnv,
			endpoints: getRoutesList('json'),
		};

		res.json(homeResponse);
	});

	//404 Handler for unwatched routes
	router.get('{*splat}', (req: Request, res: Response) => {
		res.status(404).json({
			error: 'Not found',
			message: `Route ${req.method} ${req.originalUrl} not found`,
			requestId: req.requestId,
			timestamp: clock.isoString(),
			endpoints: getRoutesList('json'),
		});
	});
	return router;
}

function getRoutesList(type: 'json' | 'text'): Record<string, unknown> | string[] {
	const routes = [{ name: 'home', value: '/', text: 'GET /' }];

	if (type === 'json') {
		return routes.reduce(
			(acc, { name, value }) => {
				acc[name] = value;
				return acc;
			},
			{} as Record<string, unknown>
		);
	} else {
		return routes.map((item) => item.text);
	}
}
