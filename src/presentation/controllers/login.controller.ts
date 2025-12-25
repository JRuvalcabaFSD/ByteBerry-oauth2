import { LoginRequestDTO } from '@application';
import { IConfig, ILogger, ILoginUseCase } from '@interfaces';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';

/**
 * Controller responsible for handling user login operations.
 *
 * This controller provides endpoints for rendering the login form and processing login requests.
 * It manages session cookies, applies security headers, and logs relevant events.
 *
 * @remarks
 * - Sets a session cookie upon successful login, with configurable expiration based on "remember me".
 * - Applies a Content Security Policy (CSP) nonce when rendering the login form.
 * - Uses injected use cases, logger, and configuration for business logic, logging, and environment-specific behavior.
 *
 * @constructor
 * @param usesCases - The login use case handler implementing the business logic for authentication.
 * @param logger - Logger instance for recording debug and error information.
 * @param config - Configuration provider for environment and version details.
 */

export class LoginController {
	private readonly COOKIE_NAME = 'session_id';
	private readonly COOKIE_MAX_AGE = 3600000; // 1 hour in milliseconds
	private readonly COOKIE_MAX_AGE_EXTENDED = 30 * 24 * 3600000; // 30 days in milliseconds

	constructor(
		private readonly usesCases: ILoginUseCase,
		private readonly logger: ILogger,
		private readonly config: IConfig
	) {}

	/**
	 * Handles rendering of the login form.
	 *
	 * - Checks for an existing session cookie and logs its presence if found.
	 * - Generates a cryptographically secure nonce for use in the Content Security Policy (CSP).
	 * - Sets the CSP header to allow scripts only from self and with the generated nonce.
	 * - Renders the 'login' view, passing the application version and nonce.
	 * - Logs successful rendering or errors encountered during the process.
	 *
	 * @param req - Express request object.
	 * @param res - Express response object.
	 * @param next - Express next middleware function for error handling.
	 * @returns A Promise that resolves when the login form is rendered or an error is handled.
	 */

	public getLoginForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const existingSessionId = req.cookies[this.COOKIE_NAME];
			if (existingSessionId) {
				this.logger.debug('User already has session cookie', { sessionId: existingSessionId });
			}

			const returnUrl = typeof req.query.return_url === 'string' ? req.query.return_url : undefined;

			const nonce = randomBytes(16).toString('base64');
			res.set('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}';`);
			res.render('login', {
				version: this.config.version || '0.0.0',
				nonce,
				returnUrl: returnUrl || '',
			});
			this.logger.debug('Login form rendered successfully');
		} catch (error) {
			this.logger.error('Error rendering login form', { error });
			next(error);
		}
	};

	/**
	 * Handles user login requests.
	 *
	 * Processes the login request by validating the provided credentials,
	 * logging the attempt, and invoking the use case to authenticate the user.
	 * If authentication is successful, sets a session cookie with appropriate
	 * security options and returns the user session information as JSON.
	 * Handles errors by passing them to the next middleware.
	 *
	 * @param req - Express request object containing login credentials in the body.
	 * @param res - Express response object used to set cookies and send the response.
	 * @param next - Express next function for error handling.
	 * @returns A Promise that resolves when the response is sent.
	 */

	public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const request = LoginRequestDTO.toBody(req.body, req.ip);

			this.logger.debug('Processing login request', {
				emailOrUserName: request.emailOrUserName,
				rememberMe: request.rememberMe,
				ipAddress: request.ipAddress,
			});

			const response = await this.usesCases.execute(request);

			const cookieMaxAge = request.rememberMe ? this.COOKIE_MAX_AGE_EXTENDED : this.COOKIE_MAX_AGE;

			res.cookie(this.COOKIE_NAME, response.sessionId, {
				httpOnly: true,
				secure: this.config.isProduction(),
				sameSite: 'lax',
				maxAge: cookieMaxAge,
				path: '/',
			});

			this.logger.debug('User logged in successfully', {
				userId: response.user.id,
				email: response.user.email,
				sessionId: response.sessionId,
				rememberMe: request.rememberMe,
			});

			const returnUrl = typeof req.body.return_url === 'string' ? req.body.return_url : undefined;

			if (returnUrl) {
				// Validate return_url is internal (security: prevent open redirect)
				if (this.isInternalUrl(returnUrl)) {
					this.logger.info('Redirecting after login', { returnUrl, userId: response.user.id });
					return res.redirect(returnUrl);
				} else {
					this.logger.warn('Invalid return_url detected, ignoring', { returnUrl });
					// Fall through to JSON response
				}
			}

			res.status(200).json(response.toJson());
		} catch (error) {
			next(error);
		}
	};

	/**
	 * Determines whether a given URL is considered internal to the service.
	 *
	 * This method checks the following:
	 * - Blocks protocol-relative URLs (e.g., `//example.com`) and `javascript:` URLs for security reasons.
	 * - Allows relative URLs (those starting with `/`).
	 * - For absolute URLs, verifies that the protocol, hostname, and port match the service's configured URL.
	 * - Returns `false` for invalid URL formats.
	 *
	 * @param url - The URL string to evaluate.
	 * @returns `true` if the URL is internal to the service; otherwise, `false`.
	 */

	private isInternalUrl(url: string): boolean {
		// Block protocol-relative URLs and javascript: URLs
		if (url.startsWith('//') || url.toLowerCase().startsWith('javascript:')) {
			return false;
		}

		// Allow relative URLs
		if (url.startsWith('/')) {
			return true;
		}

		// For absolute URLs, check if same origin
		try {
			const urlObj = new URL(url);
			const serviceUrl = new URL(this.config.serviceUrl);

			// Compare protocol, hostname, and port
			return urlObj.protocol === serviceUrl.protocol && urlObj.hostname === serviceUrl.hostname && urlObj.port === serviceUrl.port;
		} catch {
			// Invalid URL format
			return false;
		}
	}
}
