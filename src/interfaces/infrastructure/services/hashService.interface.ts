/**
 * Interface for hashing services that provide SHA-256 hashing and verification functionality.
 *
 * @remarks
 * Implementations of this interface should provide secure hashing using the SHA-256 algorithm,
 * as well as a method to verify if a given value matches a provided SHA-256 hash.
 */
export interface IHashService {
  /**
   * Generates a SHA-256 hash for the given value.
   *
   * @param {string} value - The input string to be hashed.
   * @return {*}  {string} - The resulting SHA-256 hash as a hexadecimal string.
   * @memberof IHashService
   */

  sha256(value: string): string;

  /**
   * Verifies if the given value matches the provided SHA-256 hash.
   *
   * @param {string} value - The input string to be verified.
   * @param {string} hash - The SHA-256 hash to compare against.
   * @return {*}  {boolean} - True if the value matches the hash, false otherwise.
   * @memberof IHashService
   */

  verifySha256(value: string, hash: string): boolean;
}
