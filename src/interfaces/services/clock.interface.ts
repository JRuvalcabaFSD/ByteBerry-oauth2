/**
 * Abstraction for obtaining the current time.
 *
 * Implementations provide a single source of truth for the current time and
 * expose it in multiple representations to simplify testing and time-related logic.
 *
 * Methods
 * - now(): Date — returns a new Date instance representing the current time.
 * - timestamp(): number — returns the current time as milliseconds since the Unix epoch.
 * - isoString(): string — returns the current time as an ISO 8601 formatted string (UTC).
 *
 * @remarks
 * Use this interface to decouple application code from the system clock and to
 * inject deterministic or mock clocks for unit tests.
 *
 * @public
 */

export interface IClock {
  /**
   * Gets the current date and time as a Date object.
   *
   * @return {*}  {Date} The current date and time.
   * @memberof IClock
   */

  now(): Date;

  /**
   * Gets the current time as a Unix timestamp.
   *
   * @return {*}  {number} The current time as a Unix timestamp.
   * @memberof IClock
   */

  timestamp(): number;

  /**
   * Gets the current time as an ISO 8601 formatted string (UTC).
   *
   * @return {*}  {string} The current time as an ISO 8601 string.
   * @memberof IClock
   */

  isoString(): string;
}
