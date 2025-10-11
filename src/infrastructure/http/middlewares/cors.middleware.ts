import cors, { CorsOptions } from 'cors';

import { IConfig } from '@/interfaces';

/**
 * Creates a CORS middleware with predefined configuration options.
 *
 * @param config - The application configuration object containing CORS origins
 * @returns A configured CORS middleware function that can be used with Express.js
 *
 * @remarks
 * The middleware is configured with:
 * - Credentials support enabled
 * - Standard HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
 * - Common headers (Content-Type, Authorization, X-Request-ID)
 * - Success status 200 for OPTIONS requests
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
