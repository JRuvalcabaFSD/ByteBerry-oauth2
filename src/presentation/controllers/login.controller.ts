import { LoginRequestDTO } from '@application';
import { IConfig, ILogger, ILoginUseCase } from '@interfaces';
import { randomBytes } from 'crypto';
import { NextFunction, Request, Response } from 'express';

//TODO documentar
export class LoginController {
	private readonly COOKIE_NAME = 'session_id';
	private readonly COOKIE_MAX_AGE = 3600000; // 1 hour in milliseconds
	private readonly COOKIE_MAX_AGE_EXTENDED = 30 * 24 * 3600000; // 30 days in milliseconds

	constructor(
		private readonly usesCases: ILoginUseCase,
		private readonly logger: ILogger,
		private readonly config: IConfig
	) {}

	public getLoginForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const existingSessionId = req.cookies[this.COOKIE_NAME];
			if (existingSessionId) {
				this.logger.debug('User already has session cookie', { sessionId: existingSessionId });
			}

			const nonce = randomBytes(16).toString('base64');
			res.set('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}';`);
			res.render('login', {
				version: this.config.version || '0.0.0',
				nonce,
			});
			this.logger.debug('Login form rendered successfully');
		} catch (error) {
			this.logger.error('Error rendering login form', { error });
			next(error);
		}
	};

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

			res.status(200).json(response.toJson());
		} catch (error) {
			next(error);
		}
	};
}
