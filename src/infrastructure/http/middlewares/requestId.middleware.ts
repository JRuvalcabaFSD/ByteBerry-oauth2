import { Request, Response, NextFunction } from 'express';
import { IUuid } from '@/interfaces';

/**
 * Creates an Express middleware function that handles request ID generation and propagation.
 *
 * This middleware checks for an existing 'x-request-id' header in the incoming request.
 * If found, it uses that value; otherwise, it generates a new unique ID using the provided
 * UUID generator. The request ID is then attached to the request object and set as a
 * response header for request tracing purposes.
 *
 * @param uuid - An instance implementing the IUuid interface for generating unique identifiers
 * @returns An Express middleware function that processes request IDs
 *
 * @example
 * ```typescript
 * const uuidGenerator = new UuidGenerator();
 * const requestIdMiddleware = createRequestIdMiddleware(uuidGenerator);
 * app.use(requestIdMiddleware);
 * ```
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
