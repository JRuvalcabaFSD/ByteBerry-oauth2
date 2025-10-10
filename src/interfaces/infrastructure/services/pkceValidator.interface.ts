/**
 * Interface for validating PKCE (Proof Key for Code Exchange) challenges and verifiers.
 *
 * PKCE is an extension to the OAuth 2.0 authorization code flow that provides
 * protection against authorization code interception attacks for public clients.
 *
 * @interface IPkceValidator
 * @since 1.0.0
 */

export interface IPkceValidator {
  /**
   * Validates a PKCE code verifier against a code challenge.
   *
   * @param {string} codeVerifier The code verifier to validate.
   * @param {string} codeChallenge The code challenge to validate against.
   * @return {*}  {Promise<void>} Resolves if the verifier matches the challenge, otherwise throws an error.
   * @throws {Error} Throws an error if the validation fails.
   * @memberof IPkceValidator
   * @since 1.0.0
   */

  validateChallenge(codeVerifier: string, codeChallenge: string): Promise<boolean>;

  /**
   * Validates the format of a PKCE challenge.
   *
   * @param {IPkceChallenge} challenge The PKCE challenge to validate.
   * @return {*}  {Promise<boolean>} True if the challenge format is valid, otherwise false.
   * @memberof IPkceValidator
   */

  validateChallengeFormat(challenge: string): Promise<boolean>;

  /**
   * Validates the format of a PKCE verifier.
   *
   * @param {IPkceVerifier} verifier The PKCE verifier to validate.
   * @return {*}  {Promise<boolean>} True if the verifier format is valid, otherwise false.
   * @memberof IPkceValidator
   */

  validateVerifierFormat(verifier: string): Promise<boolean>;
}
