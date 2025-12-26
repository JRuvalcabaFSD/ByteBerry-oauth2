import { IGetJwksUseCase } from '@interfaces';
import { NextFunction, Request, Response } from 'express';

export class JwksController {
	constructor(private readonly useCase: IGetJwksUseCase) {}

	public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const jwks = await this.useCase.execute();

			res.set({ 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' });
			res.json(jwks);
		} catch (error) {
			next(error);
		}
	};
}
