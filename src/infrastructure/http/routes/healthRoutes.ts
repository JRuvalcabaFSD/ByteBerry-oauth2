import { IHealthController } from '@/interfaces';
import { Router } from 'express';

/**
 * Creates and returns an Express Router with health-check endpoints wired to the provided controller.
 *
 * Registers the following routes on the returned Router:
 * - GET '/'   -> controller.getHealth (shallow/quick health check)
 * - GET '/deep' -> controller.getDeepHealth (deep/diagnostic health check)
 *
 * The caller is responsible for mounting the returned Router onto an Express application or parent router.
 *
 * @param controller - An object implementing IHealthController that exposes `getHealth` and `getDeepHealth` request handlers.
 * @returns A configured Express Router instance with the health endpoints registered.
 */

export function createHealthRoutes(controller: IHealthController): Router {
  const router = Router();
  router.get('/', controller.getHealth);
  router.get('/deep', controller.getDeepHealth);
  return router;
}
