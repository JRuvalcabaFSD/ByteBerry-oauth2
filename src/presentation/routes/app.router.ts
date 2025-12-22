import type { Request, Response } from 'express';
import { HomeResponse, IContainer } from '@interfaces';
import { Router } from 'express';
import { createHealthRoutes } from './health.routers.js';

//TODO documentar
export function createAppRouter(c: IContainer): Router {
	const router = Router();

	const config = c.resolve('Config');
	const clock = c.resolve('Clock');
	const healthService = c.resolve('HealthService');

	const baseurl = `${config.serviceUrl}:${config.port}`;

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
			endpoints: getRoutesList('json', baseurl),
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
			endpoints: getRoutesList('json', baseurl),
		});
	});

	return router;
}

/**
 * Generates a list of available routes in either JSON or text format.
 *
 * @param type - The format of the returned routes list. Use `'json'` to get a record mapping route names to URLs, or `'text'` to get an array of route descriptions.
 * @param baseUrl - The base URL to prepend to each route.
 * @returns If `type` is `'json'`, returns an object mapping route names to their URLs. If `type` is `'text'`, returns an array of route description strings.
 */

function getRoutesList(type: 'json' | 'text', baseUrl: string): Record<string, unknown> | string[] {
	const routes = [
		{ name: 'home', value: `${baseUrl}/`, text: 'GET /' },
		{ name: 'health', value: `${baseUrl}/health`, text: 'GET /health' },
		{ name: 'deepHealth', value: `${baseUrl}/health/deep`, text: 'GET /health/deep' },
	];

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
