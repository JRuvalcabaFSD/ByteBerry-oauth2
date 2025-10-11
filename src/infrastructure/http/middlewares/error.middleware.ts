import { Request, Response, NextFunction } from 'express';
import { IConfig, ILogger } from '@/interfaces';
import { HttpError } from '@/shared';

/**
 * Creates an Express error handling middleware that logs errors and returns standardized error responses.
 *
 * @param logger - The logger instance used to log error details
 * @param config - The configuration instance to determine the environment (development or production)
 * @returns An Express error middleware function that handles unhandled errors
 *
 * @remarks
 * The middleware logs comprehensive error information including request ID, error message,
 * stack trace, HTTP method, and URL. In development mode, it returns the actual error
 * message to the client, while in production it returns a generic error message for security.
 *
 * @example
 * ```typescript
 * const errorMiddleware = createErrorMiddleware(logger);
 * app.use(errorMiddleware);
 * ```
 */
export function createErrorMiddleware(logger: ILogger, config: IConfig) {
  return (error: Error, req: Request, res: Response, _next: NextFunction): void => {
    const requestId = req.requestId || 'unknown';

    logger.error('Unhandled error in request', {
      requestId,
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl || req.url,
    });

    if (error instanceof HttpError) {
      const { name, statusCode, message } = error;
      res.status(statusCode).json({
        error: name,
        requestId,
        message,
      });
    } else {
      res.status(500).json({
        error: 'Internal Server Error',
        message: config.isDevelopment() ? error.message : 'Something went wrong',
        requestId,
        timestamp: new Date().toISOString(),
      });
    }
  };
}
