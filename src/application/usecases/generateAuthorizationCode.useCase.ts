import { AuthorizationCodeEntity } from '@/domain';
import { IAuthorizationCodeMetadata, IAuthorizationCodeRepository, ILogger, IUuid } from '@/interfaces';

export interface IGenerateAuthorizationCodeInput {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scopes?: string[] | undefined;
}

/**
 * Use case for generating OAuth2 authorization codes.
 *
 * This class encapsulates the logic required to generate a new authorization code,
 * persist it using the provided repository, and log relevant events.
 * The generated code includes a prefix, a timestamp, and a unique identifier.
 * The code is associated with metadata such as client ID, redirect URI, code challenge,
 * expiration time, and requested scopes.
 *
 * @remarks
 * - The authorization code expires after a fixed duration (default: 600 seconds).
 * - Throws an error if the generated code is invalid or if persistence fails.
 *
 * @example
 * ```typescript
 * const useCase = new GenerateAuthorizationCodeUseCase(repository, uuid, logger);
 * const code = await useCase.execute({
 *   clientId: 'client123',
 *   redirectUri: 'https://example.com/callback',
 *   codeChallenge: 'abc123',
 *   scopes: ['read', 'write'],
 * });
 * ```
 *
 * @public
 */

export class GenerateAuthorizationCodeUseCase {
  private static readonly CODE_PREFIX = 'AC';
  private static readonly CODE_EXPIRATION_SECONDS = 600;

  /**
   * Creates an instance of GenerateAuthorizationCodeUseCase.
   * @param {IAuthorizationCodeRepository} repository - The repository for persisting authorization codes.
   * @param {IUuid} uuid - Utility for generating unique identifiers.
   * @param {ILogger} logger - Logger for logging events and errors.
   * @memberof GenerateAuthorizationCodeUseCase
   */

  constructor(
    private readonly repository: IAuthorizationCodeRepository,
    private readonly uuid: IUuid,
    private readonly logger: ILogger
  ) {}

  /**
   * Executes the use case to generate a new authorization code.
   *
   * @param {IGenerateAuthorizationCodeInput} input - The input parameters for generating the authorization code.
   * @return {*}  {Promise<string>} - A promise that resolves to the generated authorization code.
   * @example
   * ```typescript
   * const useCase = new GenerateAuthorizationCodeUseCase(repository, uuid, logger);
   * const code = await useCase.execute({
   *   clientId: 'client123',
   *   redirectUri: 'https://example.com/callback',
   *   codeChallenge: 'abc123',
   *   scopes: ['read', 'write'],
   * });
   * ```
   * @memberof GenerateAuthorizationCodeUseCase
   */

  public async execute(input: IGenerateAuthorizationCodeInput): Promise<string> {
    const context = 'GenerateAuthorizationCodeUseCase.execute';

    this.logger.info('Generating authorization code', { context, clientId: input.clientId, hasScopes: !!input.scopes });

    try {
      const code = this.generateCode();

      const expiresAt = new Date(Date.now() + GenerateAuthorizationCodeUseCase.CODE_EXPIRATION_SECONDS * 1000);

      const metadata: IAuthorizationCodeMetadata = {
        clientId: input.clientId,
        redirectUri: input.redirectUri,
        codeChallenge: input.codeChallenge,
        expiresAt,
        scopes: input.scopes,
      };

      const authCodeEntity = new AuthorizationCodeEntity(code, metadata);

      if (!authCodeEntity.isValid()) throw new Error('Generated authorization code is invalid');

      await this.repository.save(authCodeEntity.toObject());

      this.logger.info('Authorization code generated successfully', { context, code, expiresAt: expiresAt.toISOString() });

      return code;
    } catch (error) {
      this.logger.error('Failed to generate authorization code', {
        context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generates a unique authorization code string.
   *
   * The generated code consists of a prefix, the current timestamp, and a unique identifier.
   * The unique identifier is derived from a UUID with dashes removed and truncated to 16 characters.
   *
   * @returns {string} The generated authorization code in the format:
   *   `${CODE_PREFIX}_${timestamp}_${uniqueId}`
   */

  private generateCode(): string {
    const timestamp = Date.now();
    const uniqueId = this.uuid.generate().replace(/-/g, '').substring(0, 16);
    return `${GenerateAuthorizationCodeUseCase.CODE_PREFIX}_${timestamp}_${uniqueId}`;
  }
}
