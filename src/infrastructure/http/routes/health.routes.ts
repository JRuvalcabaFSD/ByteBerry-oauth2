import { Router } from 'express';

import { IHealthController } from '@/interfaces';

/**
 * Creates and configures an Express Router that exposes health check endpoints.
 *
 * Registers the following routes:
 * - GET /health — Lightweight liveness/readiness probe.
 * - GET /health/deep — Deep health probe that may verify external dependencies.
 *
 * The provided controller supplies the request handlers bound to each route.
 *
 * @param controller - Implementation of IHealthController providing `getHealth`
 * and `getDeepHealth` handlers.
 * @returns A configured Express Router with health routes attached.
 *
 * @example
 * ```ts
 * import express from 'express';
 * import { createHealthRoutes } from './health.routes';
 * import { HealthController } from './health.controller';
 *
 * const app = express();
 * const controller = new HealthController();
 * app.use(createHealthRoutes(controller));
 * ```
 *
 * @public
 */
export function createHealthRoutes(controller: IHealthController): Router {
  const router = Router();
  router.get('/health', controller.getHealth);
  router.get('/health/deep', controller.getDeepHealth);
  return router;
}
