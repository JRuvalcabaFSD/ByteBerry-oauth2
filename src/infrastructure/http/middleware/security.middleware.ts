import { Request, Response, NextFunction } from 'express';

import { ISecurityMiddleware, MiddlewareFunction } from '@/interfaces';

/**
 * Security headers middleware implementation
 * @export
 * @class SecurityMiddleware
 * @implements {ISecurityMiddleware}
 */
export class SecurityMiddleware implements ISecurityMiddleware {
  /**
   * Create security headers middleware function
   * @return {*}  {MiddlewareFunction}
   * @memberof SecurityMiddleware
   */
  public create(): MiddlewareFunction {
    return (_req: Request, res: Response, next: NextFunction): void => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    };
  }
}

/**
 * Security headers middleware factory function
 * @export
 * @return {*}  {MiddlewareFunction}
 */
export function securityHeadersMiddleware(): MiddlewareFunction {
  const middleware = new SecurityMiddleware();
  return middleware.create();
}
