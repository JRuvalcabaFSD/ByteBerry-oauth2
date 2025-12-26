import { IGetJwksUseCase, IJwksService, JwksResponse } from '@interfaces';

/**
 * Use case for retrieving the JSON Web Key Set (JWKS).
 *
 * This class implements the `IGetJwksUseCase` interface and delegates the retrieval
 * of JWKS to the provided `IJwksService` instance.
 *
 * @example
 * const useCase = new GetJwksUseCase(jwksService);
 * const jwks = await useCase.execute();
 *
 * @remarks
 * The JWKS is typically used for verifying JWT signatures.
 */

export class GetJwksUseCase implements IGetJwksUseCase {
	constructor(private readonly service: IJwksService) {}

	/**
	 * Retrieves the JSON Web Key Set (JWKS) by delegating the call to the underlying service.
	 *
	 * @returns {Promise<JwksResponse>} A promise that resolves to the JWKS response.
	 */

	public async execute(): Promise<JwksResponse> {
		return await this.service.getJwks();
	}
}
