/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { IClock, ILogger } from '@/interfaces';

/**
 * Creates an Express middleware for request logging that tracks incoming requests and their completion.
 *
 * This middleware adds a child logger to each request with contextual information and logs both
 * the start and completion of requests. It measures request duration and logs different levels
 * based on response status codes.
 *
 * @param logger - The logger instance used to create child loggers for each request
 * @param clock - The clock service used to measure request duration timestamps
 *
 * @returns An Express middleware function that handles request logging
 *
 * @throws {Error} When the request ID middleware has not been applied before this middleware
 *
 * @example
 * ```typescript
 * const loggerMiddleware = createLoggerMiddleware(logger, clock);
 * app.use(loggerMiddleware);
 * ```
 *
 * @remarks
 * - Requires request ID middleware to be applied first
 * - Adds `logger` and `startTime` properties to the request object
 * - Logs at INFO level for successful requests (status < 400)
 * - Logs at WARN level for error requests (status >= 400)
 * - Captures request method, URL, user agent, IP address, and response details
 */
export function createLoggerMiddleware(logger: ILogger, clock: IClock) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = clock.timestamp();

    if (!req.requestId) throw new Error('Request ID middleware must be applied before logging middleware');

    req.logger = logger.child({
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
    });

    req.startTime = startTime;

    req.logger.info('Incoming request', {
      method: req.method,
      url: req.originalUrl || req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket?.remoteAddress || 'unknown',
    });

    const originalEnd = res.end;
    res.end = function (chuck?: any, encoding?: any, cb?: any): Response {
      const duration = clock.timestamp() - startTime;

      const context = {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('Content-Length'),
      };

      if (res.statusCode >= 400) {
        req.logger?.warn('Request completed with error', context);
      } else {
        req.logger?.info('Request completed', context);
      }

      return originalEnd.call(res, chuck, encoding, cb);
    } as typeof originalEnd;

    next();
  };
}
