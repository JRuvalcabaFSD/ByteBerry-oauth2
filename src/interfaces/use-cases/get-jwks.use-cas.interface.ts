import { JwksResponse } from '@interfaces';

/**
 * Use case interface for retrieving JSON Web Key Sets (JWKS).
 *
 * Implementations of this interface should provide the logic to fetch and return
 * a JWKS response, typically used for verifying JWT signatures.
 *
 * @remarks
 * This interface is intended to abstract the retrieval of JWKS, allowing for different
 * sources or strategies (e.g., remote HTTP endpoint, local cache, etc.).
 *
 * @method execute - Retrieves the JWKS.
 * @example
 * ```typescript
 * const getJwksUseCase: IGetJwksUseCase = ...; // obtain an instance
 * const jwksResponse = await getJwksUseCase.execute();
 * console.log(jwksResponse.keys);
 * ```
 *
 * @returns A promise that resolves to a {@link JwksResponse} containing the JWKS data.
 */

export interface IGetJwksUseCase {
	execute(): Promise<JwksResponse>;
}
