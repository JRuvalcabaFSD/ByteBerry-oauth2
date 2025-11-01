import { Request, Response } from 'express';
import { IContainer } from '@/interfaces';
import { Router } from 'express';

//TODO documentar
export function createAppRoutes(container: IContainer): Router {
  const router = Router();

  const config = container.resolve('Config');
  const clock = container.resolve('Clock');

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
 * Retrieves a list of available routes in the application.
 *
 * @param type - The format of the returned routes list:
 *               - 'json': Returns an object with route names as keys and paths as values
 *               - 'text': Returns an array of route descriptions in "METHOD /path" format
 *
 * @returns A Record object mapping route names to paths when type is 'json',
 *          or an array of route description strings when type is 'text'
 *
 * @example
 * ```typescript
 * // Returns { home: '/' }
 * getRoutesList('json');
 *
 * // Returns ['GET /']
 * getRoutesList('text');
 * ```
 */

function getRoutesList(type: 'json' | 'text'): Record<string, unknown> | string[] {
  const routes = [
    { name: 'home', value: '/', text: 'GET /' },
    // { name: 'health', value: '/health', text: 'GET /health' },
    // { name: 'deepHealth', value: '/health/deep', text: 'GET /health/deep' },
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
