import { Request, Response, Router } from 'express';
import { ServiceMap } from '@/container';
import { IContainer } from '@/interfaces';
import { createHealthRoutes } from '@/infrastructure/http/routes/healthRoutes';

//TODO documentar
export function createAppRoutes(container: IContainer<ServiceMap>): Router {
  const router = Router();
  const config = container.resolve('Config');
  const clock = container.resolve('Clock');

  //Health Routes
  router.use('/health', createHealthRoutes(container.resolve('HealthController')));

  //Home route
  router.get('/', (req: Request, res: Response) => {
    res.json({
      service: config.serviceName,
      version: config.version,
      status: 'running',
      timestamp: clock.isoString(),
      requestId: req.requestId,
      environment: config.nodeEnv,
      endpoints: getRoutesList('json'),
    });
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

/**
 * Returns the application's routes in either a JSON mapping or a textual list.
 *
 * @param type - The desired output format:
 *   - `'json'` returns an object mapping each route's `name` to its `value`.
 *   - `'text'` returns an array of human-readable route descriptions (the `text` property).
 * @returns A `Record<string, unknown>` when `type` is `'json'`, or a `string[]` when `type` is `'text'`.
 *
 * @example
 * // JSON output
 * // { home: '/' }
 * const map = getRoutesList('json');
 *
 * @example
 * // Text output
 * // ['GET /']
 * const list = getRoutesList('text');
 *
 * @remarks
 * The function currently derives routes from a hard-coded array of objects with properties
 * `{ name, value, text }`. Only `name`, `value`, and `text` are considered. When extending
 * the routes source, ensure `name` is unique if using the `'json'` format.
 */

function getRoutesList(type: 'json' | 'text'): Record<string, unknown> | string[] {
  const routes = [
    { name: 'home', value: '/', text: 'GET /' },
    { name: 'health', value: '/health', text: 'GET /health' },
    { name: 'deepHealth', value: '/health/deep', text: 'GET /health/deep' },
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
    return routes.map(item => item.text);
  }
}
