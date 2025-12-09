import { TokenRequestCommand } from '@application';
import { IExchangeCodeForTokenUseCase } from '@interfaces';
import { NextFunction, Request, Response } from 'express';

/**
 * Controller responsible for handling OAuth2 token exchange requests.
 *
 * This controller processes incoming HTTP requests to exchange authorization codes
 * for access tokens by delegating the business logic to the appropriate use case.
 *
 * @remarks
 * The controller follows the dependency injection pattern, receiving the use case
 * implementation through its constructor. It handles the request/response cycle
 * and delegates error handling to the Express error handling middleware.
 *
 * @example
 * ```typescript
 * const tokenController = new TokenController(exchangeCodeForTokenUseCase);
 * router.get('/token', tokenController.handle);
 * ```
 */

export class TokenController {
	constructor(private readonly usecase: IExchangeCodeForTokenUseCase) {}
	public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const request = TokenRequestCommand.fromQuery(req.body);
			const token = await this.usecase.execute(request);
			res.json(token);
		} catch (error) {
			next(error);
		}
	};
}
