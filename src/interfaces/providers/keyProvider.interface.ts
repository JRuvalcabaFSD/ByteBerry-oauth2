/**
 * Interface for key providers that supply cryptographic keys and key identifiers.
 *
 * Implementations of this interface are responsible for providing access to
 * private and public keys, as well as a unique key identifier.
 *
 * @remarks
 * This interface is typically used in authentication and authorization systems
 * where cryptographic operations are required.
 *
 * @method getPrivateKey Returns the private key as a string.
 * @method getPublicKey Returns the public key as a string.
 * @method getKeyId Returns the unique identifier for the key.
 */

export interface IKeyProvider {
  /**
   * Gets the private key.
   *
   * @return {*}  {string} The private key as a string.
   * @memberof IKeyProvider
   */

  getPrivateKey(): string;

  /**
   * Gets the public key.
   *
   * @return {*}  {string} The public key as a string.
   * @memberof IKeyProvider
   */

  getPublicKey(): string;

  /**
   * Gets the key identifier.
   *
   * @return {*}  {string} The unique identifier for the key.
   * @memberof IKeyProvider
   */

  getKeyId(): string;
}
