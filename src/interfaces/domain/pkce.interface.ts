/**
 * Represents the code challenge method used in PKCE (Proof Key for Code Exchange) flow.
 * Currently only supports the SHA256 method as specified in RFC 7636.
 *
 * @see {@link https://tools.ietf.org/html/rfc7636#section-4.3 | RFC 7636 - Code Challenge Methods}
 */

export type PkceChallengerMethod = 'S256';

/**
 * Represents a PKCE (Proof Key for Code Exchange) challenge used in OAuth 2.0 authorization flows.
 *
 * @property code_challenge - The code challenge string, typically a hashed and encoded value derived from a code verifier.
 * @property code_challenge_method - The method used to generate the code challenge (e.g., "S256" or "plain").
 */

export interface IPkceChallenge {
  code_challenge: string;
  code_challenge_method: PkceChallengerMethod;
}

/**
 * Represents a PKCE (Proof Key for Code Exchange) code verifier.
 *
 * The `code_verifier` is a high-entropy cryptographic random string used to mitigate authorization code interception attacks in OAuth 2.0 flows.
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1 RFC 7636 Section 4.1}
 */

export interface IPkceVerifier {
  code_verifier: string;
}

/**
 * Represents the combined PKCE (Proof Key for Code Exchange) data,
 * including both the code challenge and the code verifier.
 *
 * @see IPkceChallenge for the code challenge structure.
 * @see IPkceVerifier for the code verifier structure.
 */

export interface IPkceData extends IPkceChallenge, IPkceVerifier {}
