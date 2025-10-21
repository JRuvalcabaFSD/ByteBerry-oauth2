import { Request, Response, NextFunction } from 'express';
import { IUuid } from '@/interfaces';

/**
 * Creates an Express middleware that ensures each HTTP request has a stable request identifier.
 *
 * The middleware will:
 * - Read an incoming request ID from the `x-request-id` header (case-insensitive).
 * - If the header is absent or empty, generate a new ID using the provided `uuid.generate()` function.
 * - Attach the resulting ID to `req.requestId` (requires a Request type augmentation to include `requestId: string`).
 * - Set the `X-Request-ID` response header to the same ID.
 * - Call `next()` to continue the middleware chain.
 *
 * This middleware is synchronous and has no asynchronous side effects beyond setting headers and request properties.
 *
 * @param uuid - An object exposing a `generate(): string` method used to create a new request ID when needed.
 * @returns An Express middleware function with signature `(req, res, next) => void`.
 *
 * @remarks
 * - Consumers may rely on `req.requestId` for logging, tracing, or correlation across services.
 * - Ensure your Request type is extended to include the `requestId` property to avoid TypeScript errors.
 *
 * @example
 * // app.use(createRequestIdMiddleware(myUuidImplementation));
 */

export function createRequestIdMiddleware(uuid: IUuid) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const headerRequestId = req.headers['x-request-id'] as string;
    const requestId = headerRequestId || uuid.generate();

    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    next();
  };
}
