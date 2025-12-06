import { IHealthService } from '@interfaces';
import { Router } from 'express';

/**
 * Creates and configures an Express router for health check endpoints.
 *
 * @param controller - The health service controller that implements IHealthService interface
 * @returns An Express Router instance configured with health check routes:
 * - GET / - Basic health check endpoint
 * - GET /deep - Deep health check endpoint
 *
 * @example
 * ```typescript
 * const healthController = new HealthController();
 * const healthRouter = createHeathRouter(healthController);
 * app.use('/health', healthRouter);
 * ```
 */

export function createHeathRouter(controller: IHealthService): Router {
	const router = Router();
	router.get('/', controller.getHealth);
	router.get('/deep', controller.getDeepHealth);
	return router;
}
