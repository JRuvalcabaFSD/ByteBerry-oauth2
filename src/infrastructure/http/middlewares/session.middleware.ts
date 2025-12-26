import { NextFunction, Request, RequestHandler, Response } from 'express';

import { ILogger, ISessionRepository } from '@interfaces';

/**
 * Creates an Express middleware for validating user sessions using a session repository.
 *
 * This middleware checks for a session cookie, validates the session, and attaches the user information
 * to the request object if the session is valid. If the session is missing, invalid, or expired, it throws
 * an `UnauthorizedError`. Logging is performed for key events such as missing cookies, invalid sessions,
 * and successful validation.
 *
 * @param repository - The session repository used to retrieve and validate sessions.
 * @param logger - The logger instance used for logging debug and warning messages.
 * @returns An Express request handler that validates sessions and attaches user info to the request.
 */

export function createSessionMiddleware(repository: ISessionRepository, logger: ILogger): RequestHandler {
	const COOKIE_NAME = 'session_id';

	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const sessionId = req.cookies[COOKIE_NAME] as string | undefined;

			if (!sessionId) {
				logger.debug('No session cookie found, redirecting to login', { path: req.path, method: req.method });

				const returnUrl = encodeURIComponent(req.originalUrl);
				return res.redirect(`/auth/login?return_url=${returnUrl}`);
			}

			const session = await repository.findById(sessionId);

			if (!session) {
				logger.warn('Session not found, redirecting to login', {
					sessionId: sessionId.substring(0, 8) + '...',
					path: req.path,
				});

				const returnUrl = encodeURIComponent(req.originalUrl);
				return res.redirect(`/auth/login?return_url=${returnUrl}`);
			}

			if (session.isExpired()) {
				logger.warn('Expired session detected, redirecting to login', {
					sessionId: sessionId.substring(0, 8) + '...',
					expiresAt: session.expiresAt.toISOString(),
				});

				const returnUrl = encodeURIComponent(req.originalUrl);
				return res.redirect(`/auth/login?return_url=${returnUrl}`);
			}

			req.user = {
				userId: session.userId,
				sessionId: sessionId.substring(0, 8) + '...',
			};

			logger.debug('Session validate successfully', {
				userId: session.userId,
				sessionId: sessionId.substring(0, 8) + '...',
				path: req.path,
			});

			next();
		} catch (error) {
			logger.error('Unexpected error in session middleware', { error });
			next(error);
		}
	};
}
