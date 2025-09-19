import { Request, Response, NextFunction } from 'express';

import { ErrorMiddlewareFunction, IErrorMiddleware, ILogger } from '@/interfaces';

/**
 * Error handler middleware implementation
 * @export
 * @class ErrorHandlerMiddleware
 * @implements {IErrorMiddleware}
 */
export class ErrorHandlerMiddleware implements IErrorMiddleware {
  constructor(private readonly logger?: ILogger) {}
  /**
   * Create error handler middleware function
   * @return {*}  {ErrorMiddlewareFunction}
   * @memberof ErrorHandlerMiddleware
   */
  public create(): ErrorMiddlewareFunction {
    return (error: Error, req: Request, res: Response, _next: NextFunction): void => {
      const requestId = req.requestId || 'unknown';

      if (this.logger) {
        this.logger.error('HTTP Server Error', error, {
          requestId,
          method: req.method,
          url: req.url,
          userAgent: req.headers['user-agent'],
        });
      } else {
        // eslint-disable-next-line no-console
        console.error(`[${requestId}] Server Error:`, error);
      }

      res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An internal server error occurred',
        timestamp: new Date().toISOString(),
        requestId,
      });
    };
  }
}

/**
 * Error handler middleware factory function
 * @export
 * @return {*}  {ErrorHandlerMiddleware}
 */
export function errorHandlerMiddleware(): ErrorMiddlewareFunction {
  const middleware = new ErrorHandlerMiddleware();
  return middleware.create();
}
