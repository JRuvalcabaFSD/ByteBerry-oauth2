/**
 * Interface for loading RSA key pairs and their associated key identifier.
 *
 * Implementations of this interface provide methods to retrieve the private key,
 * public key, and a unique key identifier (key ID) for cryptographic operations.
 *
 * @remarks
 * The keys are typically used for signing and verifying tokens or other secure data.
 *
 * @interface IKeyLoader
 *
 * @method getPrivateKey - Retrieves the RSA private key as a string.
 * @method getPublicKey - Retrieves the RSA public key as a string.
 * @method getKeyId - Retrieves
 */

export interface IKeyLoader {
	getPrivateKey(): string;
	getPublicKey(): string;
	getKeyId(): string;
}
