import type { Request, Response } from 'express';
import { HomeResponse, IContainer } from '@interfaces';
import { Router } from 'express';
import { createHealthRoutes } from './health.routers.js';
import { createAuthRoutes } from './auth.routes.js';

//TODO documentar
export function createAppRouter(c: IContainer): Router {
	const router = Router();

	const config = c.resolve('Config');
	const clock = c.resolve('Clock');
	const healthService = c.resolve('HealthService');

	const baseurl = `${config.serviceUrl}:${config.port}`;

	//Auth
	router.use('/auth', createAuthRoutes(c));

	//Health routes
	router.use('/health', createHealthRoutes(healthService));

	//Home route
	router.get('/', (req: Request, res: Response) => {
		const homeResponse: HomeResponse = {
			service: config.serviceName,
			version: config.version,
			status: 'running',
			timestamp: clock.isoString(),
			requestId: req.requestId,
			environment: config.nodeEnv,
			endpoints: getRoutesList(baseurl),
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
			endpoints: getRoutesList(baseurl),
		});
	});

	return router;
}

/**
 * Generates a mapping of route names to their corresponding URLs based on the provided base URL.
 *
 * @param baseUrl - The base URL to prepend to each route path.
 * @returns An object where each key is a route name and each value is the full route URL.
 */

function getRoutesList(baseUrl: string): Record<string, unknown> | string[] {
	const routes = [
		{ name: 'home', value: `${baseUrl}/` },
		{ name: 'health', value: `${baseUrl}/health` },
		{ name: 'deepHealth', value: `${baseUrl}/health/deep` },
		{ name: 'login', value: `${baseUrl}/auth/login` },
		{ name: 'authorize', value: `${baseUrl}/auth/authorize` },
		{ name: 'token', value: `${baseUrl}/auth/token` },
		{ name: 'JWKS', value: `${baseUrl}/auth/.well-known/jwks.json` },
	];

	return routes.reduce(
		(acc, { name, value }) => {
			acc[name] = value;
			return acc;
		},
		{} as Record<string, unknown>
	);
}
