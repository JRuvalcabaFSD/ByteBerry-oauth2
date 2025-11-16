import { AuthorizeRequestDto, AuthorizeResponseDto } from '@/application';

/**
 * Use case interface for generating OAuth2 authorization codes.
 *
 * @remarks
 * This interface defines the contract for the authorization code generation use case,
 * which is part of the OAuth2 authorization code flow. It handles the initial step
 * where a client requests an authorization code from the authorization server.
 *
 * @example
 * ```typescript
 * class GenerateAuthorizationCodeUseCase implements IGenerateAuthorizationCodeUseCase {
 *   async execute(request: AuthorizeRequestDto): Promise<AuthorizeResponseDto> {
 *     // Implementation logic
 *   }
 * }
 * ```
 */

export interface IGenerateAuthorizationCodeUseCase {
  /**
   * Executes the use case to generate an authorization code.
   *
   * @param {AuthorizeRequestDto} request - The request DTO containing the necessary parameters for generating the authorization code.
   * @return {*}  {Promise<AuthorizeResponseDto>} - A promise that resolves to the response DTO containing the generated authorization code and related information.
   * @memberof IGenerateAuthorizationCodeUseCase
   */

  execute(request: AuthorizeRequestDto): Promise<AuthorizeResponseDto>;
}
