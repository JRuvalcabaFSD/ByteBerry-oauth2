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

import { InvalidValueObjectError } from '@/shared';

export class CodeVerifier {
  /**
   * Creates a new CodeVerifier instance.
   *
   * @param value - The code verifier string value
   * @private
   */

  private constructor(private readonly value: string) {}

  /**
   * Creates a new `CodeVerifier` instance after validating the provided value.
   *
   * Validates that the value:
   * - Is not empty or only whitespace.
   * - Has a length between 43 and 128 characters.
   * - Contains only base64url-encoded characters (A-Z, a-z, 0-9, '-', '_').
   *
   * @param value - The code verifier string to validate and encapsulate.
   * @returns A new `CodeVerifier` instance if validation passes.
   * @throws {InvalidValueObjectError} If the value is empty, has invalid length, or contains invalid characters.
   */

  static create(value: string): CodeVerifier {
    if (!value || value.trim().length === 0) throw new InvalidValueObjectError('Code verifier', 'cannot be empty');
    if (value.length < 43 || value.length > 128)
      throw new InvalidValueObjectError('Code verifier', 'must be between 43 and 128 characters');
    if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new InvalidValueObjectError('Code verifier', 'must be base64url encoded');

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
