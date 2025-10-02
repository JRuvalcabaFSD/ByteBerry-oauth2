import { randomUUID } from 'crypto';

import { IUuid } from '@/interfaces';

/**
 * Service for generating and validating UUID (Universally Unique Identifier) strings.
 *
 * This service implements the IUuid interface and provides functionality to:
 * - Generate new UUID version 4 strings
 * - Validate whether a given string conforms to the UUID format
 *
 * The validation follows the UUID v4 format specification with proper regex pattern matching.
 *
 * @example
 * ```typescript
 * const uuidService = new UuidService();
 *
 * // Generate a new UUID
 * const newId = uuidService.generate();
 * console.log(newId); // e.g., "550e8400-e29b-41d4-a716-446655440000"
 *
 * // Validate a UUID string
 * const isValid = uuidService.isValid("550e8400-e29b-41d4-a716-446655440000");
 * console.log(isValid); // true
 * ```
 */

export class UuidService implements IUuid {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * Generates a new UUID version 4 string.
   * @return {*}  {string} A newly generated UUID v4 string.
   * @memberof UuidService
   */

  public generate(): string {
    return randomUUID();
  }

  /**
   * Validates whether the provided string is a valid UUID v4.
   * @param {string} uuid - The UUID string to validate.
   * @return {*}  {boolean} Whether the UUID is valid.
   * @memberof UuidService
   */

  public isValid(uuid: string): boolean {
    return typeof uuid === 'string' && UuidService.UUID_REGEX.test(uuid);
  }
}

/**
 * Creates a new instance of the UUID service.
 * @returns {IUuid} A new UUID service instance that implements the IUuid interface
 */
export function createUuidService(): IUuid {
  return new UuidService();
}
