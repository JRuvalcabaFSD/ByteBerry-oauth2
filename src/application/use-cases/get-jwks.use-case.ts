import { IGetJwksUseCase, IJwksService, JwksResponse } from '@interfaces';

/**
 * Use case for retrieving JSON Web Key Sets (JWKS).
 *
 * This class implements the `IGetJwksUseCase` interface and delegates the retrieval
 * of JWKS to the provided `IJwksService` instance.
 *
 * @remarks
 * JWKS are commonly used in OAuth2 and OpenID Connect flows for verifying JWT signatures.
 *
 * @example
 * const useCase = new GetJwksUseCase(jwksService);
 * const jwks = await useCase.execute();
 *
 * @see {@link IJwksService}
 * @see {@link JwksResponse}
 */

export class GetJwksUseCase implements IGetJwksUseCase {
	/**
	 * Creates an instance of the use case with the provided JWKS service.
	 * @param service An implementation of the IJwksService interface used to interact with JWKS operations.
	 */

	constructor(private readonly service: IJwksService) {}

	/**
	 * Retrieves the JSON Web Key Set (JWKS) by invoking the underlying service.
	 *
	 * @returns {Promise<JwksResponse>} A promise that resolves to the JWKS response.
	 */

	public async execute(): Promise<JwksResponse> {
		return await this.service.getJwks();
	}
}
