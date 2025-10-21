/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { IClock, ILogger } from '@/interfaces';
import { withLoggerContext } from '@/shared';

/**
 * Creates an Express middleware that attaches a request-scoped logger to the incoming request
 * and logs request lifecycle events (incoming request and completion).
 *
 * The middleware:
 * - Verifies that a request ID has already been attached to the request (req.requestId). If not,
 *   it immediately calls next with an Error (so a request ID middleware must be used earlier).
 * - Creates a child logger from the provided logger, attaching contextual fields:
 *   requestId, method, url, userAgent and ip, and assigns it to req.logger.
 * - Records a start timestamp on the request (req.startTime) using the provided clock.
 * - Logs an "Incoming request" informational entry when the request is received.
 * - Wraps res.end to measure request duration and log a completion entry including method, url,
 *   statusCode, duration and Content-Length. Completion logs use warn level for status codes >= 400,
 *   otherwise info level.
 *
 * @param logger - Root logger implementing ILogger; used to create a per-request child logger.
 * @param clock - Clock abstraction implementing IClock; must provide a timestamp(): number method
 *                used to compute request duration.
 * @returns An Express-compatible middleware function (req, res, next) => void.
 *
 * @remarks
 * - This middleware mutates the incoming Request by adding req.logger and req.startTime.
 * - It also replaces res.end with a wrapper that preserves and calls the original implementation.
 * - Ensure a request ID middleware that sets req.requestId runs before this middleware.
 *
 * @throws {Error} If req.requestId is missing, next is invoked with an Error indicating the
 *                 Request ID middleware must be applied prior to this logging middleware.
 *
 * @example
 * // Usage (Express):
 * // app.use(requestIdMiddleware); // must run first
 * // app.use(createLoggerMiddleware(rootLogger, systemClock));
 */

export function createLoggerMiddleware(logger: ILogger, clock: IClock) {
  const ctxLogger = withLoggerContext(logger, 'createLoggerMiddleware');

  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = clock.timestamp();

    if (!req.requestId) return next(new Error('Request ID middleware must be applied before logging middleware'));

    req.logger = ctxLogger.child({
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
    res.end = function (chunk?: any, encoding?: any, cb?: any): Response {
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

      return originalEnd.call(res, chunk, encoding, cb);
    } as typeof originalEnd;

    next();
  };
}
