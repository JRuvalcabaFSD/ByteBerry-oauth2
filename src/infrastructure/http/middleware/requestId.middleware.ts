import { Request, Response, NextFunction } from 'express';

import { IRequestIdMiddleware, IUuid, MiddlewareFunction } from '@/interfaces';

/**
 * Request ID middleware implementation
 * @export
 * @class RequestIdMiddleware
 * @implements {IRequestIdMiddleware}
 */
export class RequestIdMiddleware implements IRequestIdMiddleware {
  constructor(private readonly uuid: IUuid) {}

  /**
   *
   * Create request ID middleware function
   * @return {*}  {MiddlewareFunction}
   * @memberof RequestIdMiddleware
   */
  public create(): MiddlewareFunction {
    return (req: Request, res: Response, next: NextFunction): void => {
      // Generate or use existing request ID from header
      const headerRequestId = req.headers['x-request-id'] as string;
      const requestId = headerRequestId || this.uuid.generate();

      // Set request ID in custom property (type-safe)
      req.requestId = requestId;

      // Set request ID in response header
      res.setHeader('X-Request-ID', requestId);

      next();
    };
  }
}

/**
 * Request ID middleware factory function
 * @export
 * @param {IUuid} uuid
 * @return {*}  {MiddlewareFunction}
 */
export function createRequestIdMiddleware(uuid: IUuid): MiddlewareFunction {
  const middleware = new RequestIdMiddleware(uuid);
  return middleware.create();
}
