import { IHealthService } from '@interfaces';
import { Router } from 'express';

/**
 * Creates and returns an Express router with health check endpoints.
 *
 * @param service - An implementation of the `IHealthService` interface that provides health check handlers.
 * @returns An Express `Router` instance with `/` and `/deep` GET endpoints for health checks.
 *
 * - `GET /` returns the basic health status.
 * - `GET /deep` returns a deep health status, potentially including dependencies.
 */

export function createHealthRoutes(service: IHealthService): Router {
	const router = Router();

	router.get('/', service.getHealth);
	router.get('/deep', service.getDeepHealth);

	return router;
}
