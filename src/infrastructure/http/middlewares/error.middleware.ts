import { NextFunction, Request, Response } from 'express';
import { IConfig, ILogger } from '@/interfaces';
import { withLoggerContext } from '@/shared';

type ErrorHandler = (error: Error, req: Request, res: Response, config: IConfig) => void;

/**
 * Creates an Express error-handling middleware that logs unhandled errors and returns a standardized 500 JSON response.
 *
 * @param logger - ILogger used for structured logging.
 * @param config - IConfig used to determine whether detailed error messages should be exposed (via isDevelopment()).
 * @returns An Express error-handling middleware (error, req, res, next) that:
 *   - creates a contextual logger with withLoggerContext(logger, 'createErrorMiddleware'),
 *   - logs the unhandled error including requestId, error message, stack, HTTP method, and request URL,
 *   - responds with HTTP 500 and a JSON payload: {object} containing error, message, requestId, and timestamp.
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

  const errorHandlers: { [key: string]: ErrorHandler } = {
    CorsOriginsError: (error: Error, req: Request, res: Response, config: IConfig) => {
      const requestId = req.requestId || 'unknown';
      const message = config.isDevelopment() ? error.message : 'Origin not allowed by CORS';
      res.status(403).json({
        error: 'Forbidden',
        message,
        requestId,
        timestamp: new Date().toISOString(),
      });
    },
    // Add more error handlers here as needed, e.g., AuthenticationError, ValidationError, etc.
    default: (error: Error, req: Request, res: Response, config: IConfig) => {
      const requestId = req.requestId || 'unknown';
      res.status(500).json({
        error: 'Internal Server Error',
        message: config.isDevelopment() ? error.message : 'Something went wrong',
        requestId,
        timestamp: new Date().toISOString(),
      });
    },
  };

  return (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = req.requestId || 'unknown';

    const errorName = error.name === 'Error' ? 'Unhandled' : error.name;

    ctxLogger.error(`${errorName} error in request`, {
      requestId,
      error: error.message,
      stack: error.stack === '' ? undefined : error.stack,
      method: req.method,
      url: req.originalUrl || req.url,
    });

    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers['default'];
    errorHandler(error, req, res, config);
  };
}
