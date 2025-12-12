import { NextFunction, Request, Response } from 'express';

import { AuthCodeRequestCommand } from '@application';
import { IGenerateAuthCodeUseCase } from '@interfaces';
import { InvalidRequestError } from '@shared';

export class AuthorizationController {
	constructor(private readonly usecase: IGenerateAuthCodeUseCase) {}

	public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const request = AuthCodeRequestCommand.fromQuery(req.query);
			const result = await this.usecase.execute(request);

			let redirectUrl: URL;
			try {
				redirectUrl = new URL(request.redirect_uri);
			} catch {
				throw new InvalidRequestError('Invalid redirect_uri: must be a valid absolute URL');
			}

			redirectUrl.searchParams.set('code', result.code);
			if (result.state) {
				redirectUrl.searchParams.set('state', result.state);
			}

			res.redirect(redirectUrl.toString());
		} catch (error) {
			next(error);
		}
	};
}
