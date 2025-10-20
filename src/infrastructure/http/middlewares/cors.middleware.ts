import cors, { CorsOptions } from 'cors';

import { IConfig } from '@/interfaces';

/**
 * Creates and configures a CORS middleware instance for use with an Express/Connect app.
 *
 * The middleware is configured with sensible defaults:
 * - origin: taken from `config.corsOrigins` (the value supplied by the application's configuration),
 * - credentials: enabled,
 * - optionsSuccessStatus: 200 (useful for legacy browsers that choke on 204),
 * - allowed HTTP methods: GET, POST, PUT, DELETE, OPTIONS,
 * - allowed headers: Content-Type, Authorization, X-Request-ID.
 *
 * @param config - Application configuration object which must include a `corsOrigins` property.
 *                 The `corsOrigins` value is forwarded directly to the underlying CORS library's `origin` option.
 * @returns An Express/Connect-compatible middleware function that enforces the described CORS policy.
 *
 * @example
 * // Register the middleware on an Express app
 * app.use(createCORSMiddleware(config));
 *
 * @remarks
 * Adjust `config.corsOrigins` if you need to allow specific origins, allow all origins, or provide a dynamic origin check.
 */

export function createCORSMiddleware(config: IConfig) {
  const corsOptions: CorsOptions = {
    origin: config.corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  };

  return cors(corsOptions);
}
