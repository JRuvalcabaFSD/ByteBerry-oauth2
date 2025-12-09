/**
 * Interface for loading RSA key pairs and their identifiers.
 *
 * @remarks
 * This interface defines the contract for services that manage RSA cryptographic keys,
 * providing access to both private and public keys along with a unique key identifier.
 * Implementations should ensure secure handling of private keys and proper key format.
 *
 * @example
 * ```typescript
 * class FileKeyLoader implements IKeyLoader {
 *   getPrivateKey(): string {
 *     return fs.readFileSync('private.pem', 'utf8');
 *   }
 *
 *   getPublicKey(): string {
 *     return fs.readFileSync('public.pem', 'utf8');
 *   }
 *
 *   getKeyId(): string {
 *     return 'key-2024-01';
 *   }
 * }
 * ```
 */

export interface IKeyLoader {
	/**
	 * Gets the RSA private key.
	 *
	 * @return {*}  {string} The RSA private key in PEM format.
	 * @memberof IKeyLoader
	 */

	getPrivateKey(): string;

	/**
	 * Gets the RSA public key.
	 *
	 * @return {*}  {string} The RSA public key in PEM format.
	 * @memberof IKeyLoader
	 */

	getPublicKey(): string;

	/**
	 * Gets the unique identifier for the RSA key pair.
	 *
	 * @return {*}  {string} The key identifier.
	 * @memberof IKeyLoader
	 */

	getKeyId(): string;
}
