import { NextFunction, Request, Response } from 'express';

import { IGenerateAuthCodeUseCase } from '@interfaces';
import { AuthCodeRequestDTO } from '@application';
import { OAuthUnAuthorizedError } from '@shared';

/**
 * Controller responsible for handling OAuth2 authorization code requests.
 *
 * This controller receives authorization requests, validates the authenticated user,
 * delegates the authorization code generation to the provided use case, and redirects
 * the user to the specified redirect URI with the generated authorization code.
 *
 * @class AuthCodeController
 * @constructor
 * @param useCase - The use case responsible for generating the authorization code.
 *
 * @method handle
 * Handles incoming HTTP requests for authorization codes.
 * - Parses and validates the request query parameters.
 * - Ensures the user is authenticated.
 * - Executes the use case to generate an authorization code.
 * - Redirects the user to the redirect URI with the code.
 * - Passes errors to the next middleware.
 *
 * @throws OAuthUnAuthorizedError If the user is not authenticated.
 */

export class AuthCodeController {
	constructor(private readonly useCase: IGenerateAuthCodeUseCase) {}

	public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const request = AuthCodeRequestDTO.fromQuery(req.query as Record<string, string>);
			const userId = req.user?.userId;

			if (!userId) throw new OAuthUnAuthorizedError('Authentication required');

			const response = await this.useCase.execute(userId, request);

			const redirectUrl = response.buildRedirectUrl(request.redirectUri);

			res.redirect(redirectUrl);
		} catch (error) {
			next(error);
		}
	};
}
