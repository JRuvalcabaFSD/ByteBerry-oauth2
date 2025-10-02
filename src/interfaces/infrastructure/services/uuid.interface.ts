/**
 * Interface for UUID (Universally Unique Identifier) operations.
 *
 * Provides methods to generate new UUIDs and validate existing UUID strings.
 * UUIDs are 128-bit identifiers that are unique across both space and time,
 * commonly used for database primary keys, session identifiers, and other
 * scenarios requiring unique identification.
 */

export interface IUuid {
  /**
   * Generates a new UUID (Universally Unique Identifier).
   * @return {*}  {string} A newly generated UUID string.
   * @memberof IUuid
   */

  generate(): string;

  /**
   * Validates whether a given string is a valid UUID format.
   * @param {string} uuid - The UUID string to validate.
   * @return {*}  {boolean} True if the string is a valid UUID, false otherwise.
   * @memberof IUuid
   */

  isValid(uuid: string): boolean;
}
