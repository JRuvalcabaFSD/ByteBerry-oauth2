/**
 * Represents a PKCE (Proof Key for Code Exchange) code verifier value object.
 *
 * The code verifier is a cryptographically random string used in the OAuth 2.0
 * authorization code flow with PKCE extension to enhance security.
 *
 * @remarks
 * The code verifier must meet the following requirements:
 * - Length between 43 and 128 characters (as per RFC 7636)
 * - Base64url encoded (only contains A-Z, a-z, 0-9, hyphen, and underscore)
 * - Cannot be empty or contain only whitespace
 *
 * @example
 * ```typescript
 * const verifier = CodeVerifier.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
 * const value = verifier.getValue();
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636 | RFC 7636 - PKCE}
 */

export class CodeVerifier {
  /**
   * Creates a new CodeVerifier instance.
   *
   * @param value - The code verifier string value
   * @private
   */

  private constructor(private readonly value: string) {}

  /**
   * Creates a new CodeVerifier instance from the provided string value.
   *
   * @param value - The code verifier string to validate and create from. Must be a base64url encoded string.
   * @returns A new CodeVerifier instance.
   * @throws {Error} If the value is empty or contains only whitespace.
   * @throws {Error} If the value length is not between 43 and 128 characters (inclusive).
   * @throws {Error} If the value is not base64url encoded (contains characters other than A-Z, a-z, 0-9, underscore, or hyphen).
   *
   * @example
   * ```typescript
   * const verifier = CodeVerifier.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
   * ```
   */

  static create(value: string): CodeVerifier {
    if (!value || value.trim().length === 0) throw new Error('Code verifier cannot be empty');
    if (value.length < 43 || value.length > 128) throw new Error('Code verifier must be between 43 and 128 characters');
    if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Code verifier must be base64url encoded');

    return new CodeVerifier(value);
  }

  /**
   * Retrieves the code verifier value.
   *
   * @returns The string representation of the code verifier value.
   */

  public getValue(): string {
    return this.value;
  }
}
