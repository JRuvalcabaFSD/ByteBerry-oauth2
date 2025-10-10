/**
 * Value object representing a PKCE (Proof Key for Code Exchange) code challenge.
 *
 * @remarks
 * This class enforces the PKCE challenge format as defined by RFC 7636 for the S256 method:
 * - The challenge must be exactly 43 characters in length.
 * - Only Base64url characters are allowed: [A-Z], [a-z], [0-9], "-", "_".
 *
 * @example
 * ```typescript
 * const challenge = new PkceChallenge('Abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE');
 * if (PkceChallenge.isValidFormat(challenge.getValue())) {
 *   // Valid PKCE challenge
 * }
 * ```
 *
 * @public
 */

export class PkceChallenge {
  private static readonly CHALLENGE_LENGTH = 43;
  private static readonly CHALLENGE_PATTERN = /^[A-Za-z0-9\-_]+$/;

  private readonly value: string;

  /**
   * Creates a new PkceChallenge instance
   *
   * @param {string} challenge - The code challenge string
   * @throws {Error} If challenge format is invalid
   *
   * @description
   * Validates that the challenge:
   * - Is exactly 43 characters (Base64url SHA256)
   * - Contains only valid Base64url characters [A-Za-z0-9-_]
   */
  constructor(challenge: string) {
    if (!PkceChallenge.isValidFormat(challenge)) {
      throw new Error(`Invalid PKCE challenge format. Expected Base64url SHA256 (43 chars), got: ${challenge?.length || 0} chars`);
    }
    this.value = challenge;
  }

  /**
   * Validates PKCE challenge format according to RFC 7636
   *
   * @static
   * @param {string} challenge - Challenge string to validate
   * @returns {boolean} True if format is valid
   *
   * @description
   * RFC 7636 requirements for S256 method:
   * - Length: Exactly 43 characters (Base64url SHA256)
   * - Characters: [A-Z] [a-z] [0-9] "-" "_"
   */
  public static isValidFormat(challenge: string): boolean {
    if (!challenge) {
      return false;
    }

    // Check exact length (Base64url SHA256 = 43 characters)
    if (challenge.length !== PkceChallenge.CHALLENGE_LENGTH) {
      return false;
    }

    // Check character pattern (Base64url: [A-Za-z0-9-_])
    if (!PkceChallenge.CHALLENGE_PATTERN.test(challenge)) {
      return false;
    }

    return true;
  }

  /**
   * Gets the challenge value
   *
   * @returns {string} The code challenge string
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compares this challenge with another
   *
   * @param {PkceChallenge} other - Challenge to compare with
   * @returns {boolean} True if challenges are equal
   */
  public equals(other: PkceChallenge): boolean {
    return this.value === other.value;
  }

  /**
   * String representation
   *
   * @returns {string} The challenge value
   */
  public toString(): string {
    return this.value;
  }
}
