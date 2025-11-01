/**
 * Service interface for generating and validating UUID strings.
 *
 * Implementations provide a canonical way to produce UUIDs (typically RFC 4122,
 * e.g., version 4) and to verify whether a given string is a valid UUID.
 *
 * Responsibilities:
 * - generate(): produce a new UUID string suitable for use as a unique identifier.
 * - isValid(uuid): perform a syntactic validation of the provided string and return
 *   true if it conforms to the expected UUID format.
 *
 * @remarks
 * - Validation is intended to be syntactic (format, variant/version where applicable)
 *   and does not guarantee global uniqueness.
 * - For security- or collision-sensitive contexts, implementations should use a
 *   cryptographically secure RNG when generating UUIDs.
 *
 * @example
 * // Generate and validate a UUID
 * const id = uuidService.generate();
 * if (uuidService.isValid(id)) {
 *   // id is a well-formed UUID string
 * }
 */

export interface IUuid {
  /**
   * Generate a new UUID.
   *
   * @return {*}  {string} The generated UUID string.
   * @memberof IUuid
   */

  generate(): string;

  /**
   * Validate a UUID.
   *
   * @param {string} uuid The UUID string to validate.
   * @return {*}  {boolean} True if the UUID is valid, false otherwise.
   * @memberof IUuid
   */

  isValid(uuid: string): boolean;
}
