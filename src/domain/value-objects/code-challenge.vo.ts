/**
 * Value Object representing a PKCE (Proof Key for Code Exchange) code challenge.
 *
 * This class encapsulates the code challenge and its method (S256 or plain) used in
 * OAuth 2.0 authorization flows to prevent authorization code interception attacks.
 *
 * @remarks
 * The code challenge must be:
 * - At least 43 characters long
 * - Base64URL encoded (only contains A-Z, a-z, 0-9, _, -)
 * - Use either 'S256' (SHA-256 hash) or 'plain' method
 *
 * @example
 * ```typescript
 * const challenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
 * console.log(challenge.getMethod()); // 'S256'
 * console.log(challenge.isPlainMethod()); // false
 * ```
 */
export class CodeChallengeVO {
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
	 * Creates a new CodeChallengeVO instance with the provided challenge string and method.
	 *
	 * @param challenge - The code challenge string, must be at least 43 characters long and base64url encoded
	 * @param method - The code challenge method, either 'S256' (SHA-256) or 'plain'
	 * @returns A new CodeChallengeVO instance
	 * @throws {Error} If challenge or method is empty
	 * @throws {Error} If challenge is less than 43 characters or contains only whitespace
	 * @throws {Error} If challenge is not base64url encoded (contains invalid characters)
	 * @throws {Error} If method is not 'S256' or 'plain'
	 */

	static create(challenge: string, method: 'S256' | 'plain'): CodeChallengeVO {
		if (!challenge || !method) throw new Error('Code challenge cannot be empty');
		if (challenge.length < 43 || challenge.trim().length === 0)
			throw new Error('Code challenge must be at least 43 characters long and not empty');
		if (!/^[A-Za-z0-9_-]+$/.test(challenge)) throw new Error('Code challenge must be base64url encoded');
		if (method !== 'S256' && method !== 'plain') throw new Error('Code challenge method must be S256 or plain');

		return new CodeChallengeVO(challenge, method);
	}

	/**
	 * Checks if the code challenge method is 'plain'.
	 *
	 * @returns {boolean} True if the method is 'plain', false otherwise.
	 */

	public isPlainMethod(): boolean {
		return this.method === 'plain';
	}

	/**
	 * Verifies a plain code verifier against the stored code challenge.
	 *
	 * This method performs a direct string comparison between the provided verifier
	 * and the stored challenge value. It should only be used when the challenge method
	 * is set to 'plain' (as per RFC 7636 PKCE specification).
	 *
	 * @param verifier - The code verifier string to validate against the challenge
	 * @returns `true` if the verifier matches the challenge, `false` otherwise
	 * @throws {Error} If the challenge method is not 'plain'
	 *
	 * @example
	 * ```typescript
	 * const challenge = new CodeChallenge('my-secret-value', 'plain');
	 * const isValid = challenge.verifyPlain('my-secret-value'); // returns true
	 * ```
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
	 * @returns The code challenge string used in the PKCE (Proof Key for Code Exchange) flow.
	 */

	public getChallenge(): string {
		return this.challenge;
	}

	/**
	 * Returns the code challenge method used for PKCE (Proof Key for Code Exchange).
	 *
	 * @returns {string} The challenge method (e.g., 'S256', 'plain')
	 */

	public getMethod(): string {
		return this.method;
	}
}
