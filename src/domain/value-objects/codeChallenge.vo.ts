/**
 * Represents a PKCE (Proof Key for Code Exchange) code challenge used in OAuth 2.0 authorization flows.
 *
 * @remarks
 * This value object encapsulates the code challenge and its corresponding method (S256 or plain).
 * The challenge must be a base64url-encoded string with a minimum length of 43 characters.
 *
 * @example
 * ```typescript
 * const challenge = CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
 * const isValid = challenge.verify('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
 * ```
 */

import { InvalidValueObjectError } from '@/shared';

export class CodeChallenge {
  /**
   * Creates a new CodeChallenge instance.
   *
   * @param challenge - The code challenge string used in the PKCE flow
   * @param method - The code challenge method, either 'S256' (SHA-256) or 'plain'
   * @private
   */

  private constructor(
    private readonly challenge: string,
    private readonly method: 'S256' | 'plain'
  ) {}

  /**
   * Creates a new `CodeChallenge` value object after validating the provided challenge and method.
   *
   * @param challenge - The code challenge string, which must be base64url encoded, non-empty, and at least 43 characters long.
   * @param method - The code challenge method, which must be either `'S256'` or `'plain'`.
   * @returns A new instance of `CodeChallenge` if validation passes.
   * @throws {InvalidValueObjectError} If the challenge is empty, too short, not base64url encoded, or if the method is invalid.
   */

  static create(challenge: string, method: 'S256' | 'plain'): CodeChallenge {
    if (!challenge || !method) throw new InvalidValueObjectError('Code challenge ', 'cannot be empty');
    if (challenge.length < 43 || challenge.trim().length === 0) throw new InvalidValueObjectError('Code challenge', 'cannot be empty');
    if (!/^[A-Za-z0-9_-]+$/.test(challenge)) throw new InvalidValueObjectError('Code challenge', 'must be base64url encoded');
    if (method !== 'S256' && method !== 'plain') throw new InvalidValueObjectError('Code challenge', 'method must be S256 or plain');

    return new CodeChallenge(challenge, method);
  }

  /**
   * Determines if the code challenge method is set to 'plain'.
   *
   * @returns {boolean} `true` if the method is 'plain'; otherwise, `false`.
   */

  public isPlainMethod(): boolean {
    return this.method === 'plain';
  }

  /**
   * Verifies that the provided verifier matches the stored challenge when using the 'plain' method.
   *
   * @param verifier - The string to compare against the stored challenge.
   * @returns `true` if the verifier matches the challenge; otherwise, `false`.
   * @throws Error if the challenge method is not 'plain'.
   */

  public verifyPlain(verifier: string): boolean {
    if (this.method !== 'plain') {
      throw new Error('This method only works for plain challenge method');
    }
    return this.challenge === verifier;
  }

  /**
   * Retrieves the code challenge value.
   *
   * @returns {string} The code challenge string used in the PKCE (Proof Key for Code Exchange) flow.
   */

  public getChallenge(): string {
    return this.challenge;
  }

  /**
   * Gets the code challenge method used for PKCE (Proof Key for Code Exchange).
   *
   * @returns The method string indicating the challenge method (e.g., "plain" or "S256").
   */

  public getMethod(): string {
    return this.method;
  }
}
