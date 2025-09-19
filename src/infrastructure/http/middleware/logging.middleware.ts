/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { ILogger, MiddlewareFunction } from '@/interfaces';

/**
 * HTTP request logging middleware implementation
 * @export
 * @class LoggingMiddleware
 */
export class LoggingMiddleware {
  constructor(private readonly logger: ILogger) {}

  /**
   * Create HTTP logging middleware function
   * @return {*}  {MiddlewareFunction}
   * @memberof LoggingMiddleware
   */
  public create(): MiddlewareFunction {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();
      const { method, url, headers } = req;
      const requestId = req.requestId ?? '';

      // Log incoming request
      this.logger.info('HTTP Request', {
        requestId,
        method,
        url,
        userAgent: headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
      });

      // Override res.end to log response
      const originalEnd = res.end.bind(res);
      const loggerInstance = this.logger; // Capture logger in closure

      res.end = function (chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
        const duration = Date.now() - startTime;
        const { statusCode } = res;

        // Determine log level based on status code
        const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

        // Log response using captured logger
        loggerInstance[logLevel]('HTTP Response', {
          requestId,
          method,
          url,
          statusCode,
          duration,
          contentLength: res.get('content-length'),
        });

        // Call original end method with proper type handling
        if (typeof encoding === 'function') {
          // res.end(chunk, callback) - encoding is actually the callback
          return originalEnd(chunk, encoding);
        } else if (cb !== undefined) {
          // res.end(chunk, encoding, callback) - all three parameters
          return originalEnd(chunk, encoding as BufferEncoding, cb);
        } else if (encoding !== undefined) {
          // res.end(chunk, encoding) - encoding is BufferEncoding
          return originalEnd(chunk, encoding as BufferEncoding);
        } else if (chunk !== undefined) {
          // res.end(chunk) - only chunk
          return originalEnd(chunk);
        } else {
          // res.end() - no parameters
          return originalEnd();
        }
      };

      next();
    };
  }
}

/**
 * HTTP logging middleware factory function
 * @export
 * @param {ILogger} logger Logger service instance
 * @return {*}  {MiddlewareFunction}
 */
export function createLoggingMiddleware(logger: ILogger): MiddlewareFunction {
  const middleware = new LoggingMiddleware(logger);
  return middleware.create();
}
