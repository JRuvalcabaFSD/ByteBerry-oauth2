import { JwksResponse } from '@interfaces';

/**
 * Use case interface for retrieving JSON Web Key Sets (JWKS).
 *
 * Implementations of this interface should provide logic to fetch and return JWKS,
 * typically used for validating JWT signatures.
 *
 * @returns A promise that resolves to a {@link JwksResponse} containing the JWKS data.
 */
export interface IGetJwksUseCase {
	/**
	 * Executes the retrieval of JSON Web Key Sets (JWKS).
	 *
	 * @return {*}  {Promise<JwksResponse>} - A promise that resolves to a {@link JwksResponse} containing the JWKS data.
	 * @memberof IGetJwksUseCase
	 */

	execute(): Promise<JwksResponse>;
}
