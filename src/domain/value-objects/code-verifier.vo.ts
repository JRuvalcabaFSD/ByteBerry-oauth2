/**
 * Value Object representing a Code Verifier for PKCE (Proof Key for Code Exchange) flow.
 *
 * A code verifier is a cryptographically random string using the characters [A-Z] / [a-z] / [0-9] / "-" / "_",
 * with a minimum length of 43 characters and a maximum length of 128 characters.
 *
 * @remarks
 * This implementation follows the OAuth 2.0 RFC 7636 specification for PKCE.
 * The code verifier must be:
 * - Non-empty
 * - Between 43 and 128 characters in length
 * - Base64url encoded (using only alphanumeric characters, hyphens, and underscores)
 *
 * @example
 * ```typescript
 * const verifier = CodeVerifierVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
 * console.log(verifier.getValue()); // Output: dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
 * ```
 */

export class CodeVerifierVO {
	private constructor(private readonly value: string) {}

	/**
	 * Creates a new CodeVerifierVO instance with validation.
	 *
	 * @param value - The code verifier string to validate and encapsulate. Must be a base64url encoded string.
	 * @returns A new CodeVerifierVO instance containing the validated code verifier.
	 * @throws {Error} If the value is empty or contains only whitespace.
	 * @throws {Error} If the value length is not between 43 and 128 characters (inclusive).
	 * @throws {Error} If the value is not base64url encoded (contains characters other than A-Z, a-z, 0-9, underscore, or hyphen).
	 *
	 * @remarks
	 * The code verifier must comply with RFC 7636 (PKCE) specifications:
	 * - Minimum length: 43 characters
	 * - Maximum length: 128 characters
	 * - Allowed characters: [A-Za-z0-9_-] (base64url encoding)
	 */

	public static create(value: string): CodeVerifierVO {
		if (!value || value.trim().length === 0) throw new Error('Code verifier cannot be empty');
		if (value.length < 43 || value.length > 128) throw new Error('Code verifier must be between 43 and 128 characters');
		if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Code verifier must be base64url encoded');

		return new CodeVerifierVO(value);
	}

	/**
	 * Gets the value of the code verifier.
	 *
	 * @returns The string value of the code verifier.
	 */

	public getValue(): string {
		return this.value;
	}
}
