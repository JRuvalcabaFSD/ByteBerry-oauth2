import { ErrorRequestHandler, RequestHandler } from 'express';

export type MiddlewareFunction = RequestHandler;
export type ErrorMiddlewareFunction = ErrorRequestHandler;

/**
 * Interface for the requestID middleware
 * @export
 * @interface IRequestIdMiddleware
 */
export interface IRequestIdMiddleware {
  create(): MiddlewareFunction;
}

/**
 * Interface for the Security middleware
 * @export
 * @interface ISecurityMiddleware
 */
export interface ISecurityMiddleware {
  create(): MiddlewareFunction;
}

/**
 * Interface for the Error middleware
 * @export
 * @interface IErrorMiddleware
 */
export interface IErrorMiddleware {
  create(): ErrorMiddlewareFunction;
}
