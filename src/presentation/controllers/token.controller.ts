import { TokenRequestDTO } from '@application';
import { IExchangeTokenUseCase } from '@interfaces';
import { NextFunction, Request, Response } from 'express';

export class TokenController {
	constructor(private readonly useCase: IExchangeTokenUseCase) {}

	public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const request = TokenRequestDTO.fromBody(req.body as Record<string, string>);
			const response = await this.useCase.execute(request);
			res.status(200).json(response.toJson());
		} catch (error) {
			next(error);
		}
	};
}
