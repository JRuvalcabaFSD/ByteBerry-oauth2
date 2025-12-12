import { NextFunction, Request, Response } from 'express';

import { IGetJwksUseCase } from '@interfaces';

/**
 * Controller responsible for handling requests to retrieve the JSON Web Key Set (JWKS).
 *
 * @remarks
 * This controller exposes a handler that responds with the JWKS in JSON format,
 * setting appropriate HTTP headers for content type, caching, and security.
 *
 * @example
 * // Usage with Express.js
 * app.get('/.well-known/jwks.json', jwksController.handle);
 *
 * @param usecase - An implementation of the IGetJwksUseCase interface used to fetch the JWKS.
 */
export class JwksController {
	/**
	 * Creates an instance of the controller with the provided use case for retrieving JWKS (JSON Web Key Sets).
	 *
	 * @param usecase - An implementation of the IGetJwksUseCase interface used to handle JWKS retrieval logic.
	 */

	constructor(private readonly usecase: IGetJwksUseCase) {}

	/**
	 * Handles HTTP requests to retrieve the JSON Web Key Set (JWKS).
	 *
	 * Sets appropriate response headers for content type, caching, and security.
	 * Responds with the JWKS in JSON format.
	 * Forwards any errors to the next middleware.
	 *
	 * @param _req - The Express request object (unused).
	 * @param res - The Express response object.
	 * @param next - The Express next middleware function.
	 * @returns A promise that resolves when the response is sent.
	 */

	public handle = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const jwks = await this.usecase.execute();

			res.set({ 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' });
			res.json(jwks);
		} catch (error) {
			next(error);
		}
	};
}
