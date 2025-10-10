import * as crypto from 'crypto';

import { PkceChallenge, PkceVerifier } from '@/domain';
import { ILogger, IPkceValidator } from '@/interfaces';

/**
 * Service responsible for validating PKCE (Proof Key for Code Exchange) challenges and verifiers
 * according to the OAuth 2.0 PKCE extension (RFC 7636).
 *
 * This service provides methods to:
 * - Validate a PKCE challenge by comparing a code verifier and code challenge using constant-time comparison.
 * - Validate the format of code challenges and code verifiers.
 * - Generate a code challenge from a code verifier using SHA-256 and base64url encoding.
 *
 * All validation and generation steps are logged for debugging and auditing purposes.
 *
 * @remarks
 * This service relies on value objects (`PkceVerifier`, `PkceChallenge`) for input validation,
 * and uses Node.js crypto utilities for secure hashing and comparison.
 *
 * @example
 * ```typescript
 * const isValid = await pkceValidatorService.validateChallenge(verifier, challenge);
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636 | RFC 7636: Proof Key for Code Exchange}
 */

export class PkceValidatorService implements IPkceValidator {
  /**
   * Creates an instance of PkceValidatorService.
   * @param {ILogger} logger - Logger instance for logging validation processes and errors.
   * @memberof PkceValidatorService
   */

  constructor(private readonly logger: ILogger) {}

  /**
   * Validates a PKCE (Proof Key for Code Exchange) challenge by comparing the provided code verifier and code challenge.
   *
   * This method generates the expected code challenge from the given code verifier and compares it to the provided code challenge
   * using a constant-time comparison to prevent timing attacks. Logs debug information and errors during the process.
   *
   * @param codeVerifier - The code verifier string provided by the client.
   * @param codeChallenge - The code challenge string to validate against.
   * @returns A promise that resolves to `true` if the challenge is valid, or `false` otherwise.
   */

  public async validateChallenge(codeVerifier: string, codeChallenge: string): Promise<boolean> {
    const context = 'PkceValidatorService.validateChallenge';
    this.logger.debug('Validating PKCE challenge', {
      context,
      codeChallengeLength: codeChallenge.length,
      codeVerifierLength: codeVerifier.length,
    });

    try {
      const verifier = new PkceVerifier(codeVerifier);
      const challenge = new PkceChallenge(codeChallenge);

      const expectedChallenge = this.generateChallengeFromVerifier(verifier);

      const isValid = this.constantTimeCompare(expectedChallenge.getValue(), challenge.getValue());

      this.logger.debug('PKCE validation result', { context, isValid });

      return isValid;
    } catch (error) {
      this.logger.error('PKCE validation failed', { context, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  /**
   * Validates the format of a PKCE code challenge.
   *
   * This method checks if the provided code challenge adheres to the expected format by attempting to create a `PkceChallenge`
   * value object. If the creation is successful, the format is considered valid; otherwise, it is invalid.
   *
   * @param {string} challenge - The code challenge string to validate.
   * @return {*}  {Promise<boolean>} A promise that resolves to `true` if the format is valid, or `false` otherwise.
   * @memberof PkceValidatorService
   */

  public async validateChallengeFormat(challenge: string): Promise<boolean> {
    const context = 'PkceValidatorService.validateChallengeFormat';
    this.logger.debug('Validating code challenge format', { context, length: challenge?.length || 0 });

    try {
      new PkceChallenge(challenge);

      this.logger.debug('Code challenge format valid', { context });

      return true;
    } catch (error) {
      this.logger.debug('Code challenge format invalid', {
        context: 'PkceValidatorService.validateChallengeFormat',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Validates the format of a PKCE code verifier.
   * This method checks if the provided code verifier adheres to the expected format by attempting to create a `PkceVerifier`
   *
   * @param {string} verifier - The code verifier string to validate.
   * @return {*}  {Promise<boolean>} A promise that resolves to `true` if the format is valid, or `false` otherwise.
   * @memberof PkceValidatorService
   */

  public async validateVerifierFormat(verifier: string): Promise<boolean> {
    const context = 'PkceValidatorService.validateVerifierFormat';
    this.logger.debug('Validating code verifier format', { context, length: verifier?.length || 0 });

    try {
      // Try to create Value Object (validates automatically)
      new PkceVerifier(verifier);

      this.logger.debug('Code verifier format valid', { context });

      return true;
    } catch (error) {
      this.logger.debug('Code verifier format invalid', { context, error: error instanceof Error ? error.message : 'Unknown error' });

      return false;
    }
  }

  /**
   * Generates a PKCE (Proof Key for Code Exchange) challenge from the provided code verifier.
   *
   * This method performs the following steps:
   * 1. Computes a SHA-256 hash of the code verifier.
   * 2. Encodes the resulting hash using base64url encoding, compliant with RFC 7636.
   * 3. Wraps the encoded challenge in a `PkceChallenge` value object and returns it.
   *
   * @param verifier - The PKCE code verifier as a `PkceVerifier` value object.
   * @returns A `PkceChallenge` value object containing the base64url-encoded challenge.
   */

  private generateChallengeFromVerifier(verifier: PkceVerifier): PkceChallenge {
    const context = 'PkceValidatorService.generateChallengeFromVerifier';
    this.logger.debug('Generating PKCE challenge', { context, codeVerifierLength: verifier.getValue().length });

    // SHA256 hash
    const hash = crypto.createHash('sha256').update(verifier.getValue()).digest();

    // Base64url encoding (RFC 7636 compliant)
    const base64url = this.base64UrlEncode(hash);

    // Create and return Value Object
    const challenge = new PkceChallenge(base64url);

    this.logger.debug('PKCE challenge generated', { context, challengeLength: challenge.getValue().length });

    return challenge;
  }

  /**
   * Encodes a Buffer to a base64url string, replacing characters to make it URL-safe and removing padding.
   *
   * @private
   * @param {Buffer} buffer - The Buffer to encode.
   * @return {*}  {string} The base64url-encoded string.
   * @memberof PkceValidatorService
   */

  private base64UrlEncode(buffer: Buffer): string {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Compares two strings in constant time to prevent timing attacks.
   *
   * @private
   * @param {string} a - The first string to compare.
   * @param {string} b - The second string to compare.
   * @return {*}  {boolean} `true` if the strings are equal, `false` otherwise.
   * @memberof PkceValidatorService
   */

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    const bufferA = Buffer.from(a, 'utf-8');
    const bufferB = Buffer.from(b, 'utf-8');

    try {
      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch {
      return false;
    }
  }
}
