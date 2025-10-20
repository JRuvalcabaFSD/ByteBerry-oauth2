import { NextFunction, Request, Response } from 'express';
import { IConfig, ILogger } from '@/interfaces';
import { withLoggerContext } from '@/shared';

/**
 * Creates an Express error-handling middleware that logs unhandled errors and returns a standardized 500 JSON response.
 *
 * @param logger - ILogger used for structured logging.
 * @param config - IConfig used to determine whether detailed error messages should be exposed (via isDevelopment()).
 * @returns An Express error-handling middleware (error, req, res, next) that:
 *   - creates a contextual logger with withLoggerContext(logger, 'createErrorMiddleware'),
 *   - logs the unhandled error including requestId, error message, stack, HTTP method, and request URL,
 *   - responds with HTTP 500 and a JSON payload: { error: 'Internal Server Error', message, requestId, timestamp }.
 *
 * @remarks
 * - If req.requestId is falsy, the middleware logs and returns 'unknown' as the requestId.
 * - When config.isDevelopment() returns true the response includes the actual error message; otherwise a generic message is returned.
 *
 * @example
 * // Register as the last middleware in an Express app:
 * // app.use(createErrorMiddleware(appLogger, config));
 */

export function createErrorMiddleware(logger: ILogger, config: IConfig) {
  const ctxLogger = withLoggerContext(logger, 'createErrorMiddleware');

  return (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = req.requestId || 'unknown';

    ctxLogger.error('Unhandled error in request', {
      requestId,
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl || req.url,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: config.isDevelopment() ? error.message : 'Something went wrong',
      requestId,
      timestamp: new Date().toISOString(),
    });
  };
}
