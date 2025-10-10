import { ILogger, IPkceValidator } from '@/interfaces';
import { BadRequestError } from '@/shared/errors/http.errors';

/**
 * Use case for validating a PKCE (Proof Key for Code Exchange) challenge.
 *
 * This class encapsulates the logic required to validate the PKCE code verifier and code challenge
 * according to the OAuth 2.0 PKCE specification. It ensures that the provided code verifier and code challenge
 * meet the required format and length constraints, and delegates the actual challenge validation to an injected
 * `IPkceValidator` implementation.
 *
 * Logging is performed at various stages of the validation process for observability.
 *
 * @remarks
 * - The code verifier must be between 43 and 128 characters and contain only unreserved characters.
 * - The code challenge must be exactly 43 characters and contain only valid base64url characters.
 * - Throws a `BadRequestError` if validation fails.
 *
 * @constructor
 * @param pkceValidator - An implementation of the PKCE validation logic.
 * @example
 * ```typescript
 * const useCase = new ValidatorPkceChallengeUseCase(pkceValidator, logger);
 * const isValid = await useCase.execute(codeVerifier, codeChallenge);
 * ```
 * @param logger - Logger for recording validation events and errors.
 */

export class ValidatorPkceChallengeUseCase {
  constructor(
    private readonly pkceValidator: IPkceValidator,
    private readonly logger: ILogger
  ) {}

  /**
   * Validates a PKCE (Proof Key for Code Exchange) challenge by checking the format of the
   * provided code verifier and code challenge, and then verifying the challenge using the PKCE validator.
   *
   * Logs the validation process and throws a `BadRequestError` if the validation fails.
   * Any errors encountered during validation are logged and rethrown.
   *
   * @param codeVerifier - The code verifier string to validate.
   * @param codeChallenge - The code challenge string to validate.
   * @returns A promise that resolves to `true` if the PKCE challenge is valid.
   * @throws {BadRequestError} If the PKCE validation fails.
   * @throws {Error} If an unexpected error occurs during validation.
   */

  public async execute(codeVerifier: string, codeChallenge: string): Promise<boolean> {
    const context = 'ValidatorPkceChallengeUseCase.execute';
    this.logger.info('Validating PKCE challenge', {
      context,
      codeChallengeLength: codeChallenge.length,
      codeVerifierLength: codeVerifier.length,
    });

    try {
      this.validateCodeVerifierFormat(codeVerifier);
      this.validateCodeChallengeFormat(codeChallenge);
      const isValid = await this.pkceValidator.validateChallenge(codeVerifier, codeChallenge);

      if (!isValid) {
        this.logger.warn('PKCE validation failed', { context });
        throw new BadRequestError('Invalid code_verifier');
      }

      this.logger.info('PKCE validation succeeded', { context });

      return true;
    } catch (error) {
      this.logger.error('PKCE validation error', { context, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Validates the format of a PKCE code verifier according to RFC 7636.
   *
   * Throws a {@link BadRequestError} if the code verifier is:
   * - Missing or not provided.
   * - Shorter than 43 characters or longer than 128 characters.
   * - Contains characters outside the allowed set: [A-Z], [a-z], [0-9], "-", ".", "_", "~".
   *
   * @param codeVerifier - The code verifier string to validate.
   * @throws {BadRequestError} If the code verifier is invalid.
   */

  private validateCodeVerifierFormat(codeVerifier: string): void {
    if (!codeVerifier || codeVerifier.length < 43 || codeVerifier.length > 128)
      throw new BadRequestError('Invalid code_verifier: must be 43-128 characters');

    const validatePattern = /^[A-Za-z0-9\-._~]+$/;
    if (!validatePattern.test(codeVerifier)) throw new BadRequestError('Invalid code_verifier: contains invalid characters');
  }

  /**
   * Validates the format of a PKCE code challenge.
   *
   * Ensures that the provided `codeChallenge` string is exactly 43 characters long
   * and contains only valid base64url characters (A-Z, a-z, 0-9, '-', '_', '/').
   * Throws a `BadRequestError` if the validation fails.
   *
   * @param codeChallenge - The code challenge string to validate.
   * @throws {BadRequestError} If the code challenge is missing, has an invalid length,
   *         or contains invalid characters.
   */

  private validateCodeChallengeFormat(codeChallenge: string): void {
    if (!codeChallenge || codeChallenge.length !== 43)
      throw new BadRequestError("Invalid code_challenge: must be 43 characters (base64url encoded SHA256)'");

    const validPattern = /^[A-Za-z0-9/-_]+$/;
    if (!validPattern.test(codeChallenge)) throw new BadRequestError('Invalid code_challenge: contains invalid characters');
  }
}
