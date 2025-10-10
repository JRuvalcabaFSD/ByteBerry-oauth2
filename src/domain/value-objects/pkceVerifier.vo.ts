/**
 * PKCE Verifier Value Object
 * @description Immutable value object representing a valid PKCE code verifier
 *
 * @class PkceVerifier
 * @author JRuvalcabaFSD
 * @since 1.4.0
 *
 * @example
 * ```typescript
 * try {
 *   const verifier = new PkceVerifier('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
 *   console.log(verifier.getValue()); // 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
 * } catch (error) {
 *   console.error('Invalid verifier format');
 * }
 * ```
 */
export class PkceVerifier {
  private static readonly MIN_LENGTH = 43;
  private static readonly MAX_LENGTH = 128;
  private static readonly VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]+$/;

  private readonly value: string;

  /**
   * Creates a new PkceVerifier instance
   *
   * @param {string} verifier - The code verifier string
   * @throws {Error} If verifier format is invalid
   *
   * @description
   * Validates that the verifier:
   * - Length is between 43-128 characters
   * - Contains only unreserved characters [A-Za-z0-9-._~]
   */
  constructor(verifier: string) {
    if (!PkceVerifier.isValidFormat(verifier)) {
      throw new Error(`Invalid PKCE verifier format. Expected 43-128 unreserved chars, got: ${verifier?.length || 0} chars`);
    }
    this.value = verifier;
  }

  /**
   * Validates PKCE verifier format according to RFC 7636
   *
   * @static
   * @param {string} verifier - Verifier string to validate
   * @returns {boolean} True if format is valid
   *
   * @description
   * RFC 7636 requirements:
   * - Length: 43-128 characters
   * - Characters: [A-Z] [a-z] [0-9] "-" "." "_" "~" (unreserved)
   */
  public static isValidFormat(verifier: string): boolean {
    if (!verifier) {
      return false;
    }

    // Check length (RFC 7636: 43-128 characters)
    if (verifier.length < PkceVerifier.MIN_LENGTH || verifier.length > PkceVerifier.MAX_LENGTH) {
      return false;
    }

    // Check character pattern (RFC 7636: unreserved characters)
    if (!PkceVerifier.VERIFIER_PATTERN.test(verifier)) {
      return false;
    }

    return true;
  }

  /**
   * Gets the verifier value
   *
   * @returns {string} The code verifier string
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compares this verifier with another
   *
   * @param {PkceVerifier} other - Verifier to compare with
   * @returns {boolean} True if verifiers are equal
   */
  public equals(other: PkceVerifier): boolean {
    return this.value === other.value;
  }

  /**
   * String representation
   *
   * @returns {string} The verifier value
   */
  public toString(): string {
    return this.value;
  }
}
