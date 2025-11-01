import { IHealthController } from '@/interfaces';
import { Router } from 'express';

export function createHealthRoutes(controller: IHealthController): Router {
  const router = Router();
  router.get('/', controller.getHealth);
  router.get('/deep', controller.getDeepHealth);
  return router;
}
