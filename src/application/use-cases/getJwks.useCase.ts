import { IJwksService, JwksResponse } from '@/interfaces';

/**
 * Use case for retrieving JSON Web Key Sets (JWKS).
 *
 * This class encapsulates the logic to fetch JWKS from the underlying service.
 *
 * @remarks
 * JWKS are used for verifying JWT signatures in OAuth2 and OpenID Connect flows.
 *
 * @example
 * const useCase = new GetJwksUseCase(jwksService);
 * const jwks = await useCase.execute();
 *
 * @public
 */

export class GetJwksUseCase {
  /**
   * Creates an instance of the use case with the provided JWKS service.
   * @param jwksService - An implementation of the IJwksService interface used to interact with JSON Web Key Sets.
   */

  constructor(private readonly jwksService: IJwksService) {}

  /**
   * Executes the use case to retrieve the JSON Web Key Set (JWKS).
   *
   * @returns {Promise<JwksResponse>} A promise that resolves to the JWKS response.
   */

  public async execute(): Promise<JwksResponse> {
    return await this.jwksService.getJwks();
  }
}
