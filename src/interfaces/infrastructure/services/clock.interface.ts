/**
 * Interface for clock operations providing various time representations.
 *
 * This interface abstracts time-related functionality, allowing for easy testing
 * and mocking of time-dependent operations in the application.
 *
 * @interface IClock
 * @since 1.0.0
 */

export interface IClock {
  /**
   * Gets the current date and time as a Date object.
   * @return {*}  {Date} The current date and time.
   * @memberof IClock
   */

  now(): Date;

  /**
   * Gets the current timestamp in milliseconds since the Unix epoch.
   * @return {*}  {number} The current timestamp in milliseconds.
   * @memberof IClock
   */
  timestamp(): number;

  /**
   * Gets the current date and time as an ISO 8601 string.
   * @return {*}  {string} The current date and time as an ISO 8601 string.
   * @memberof IClock
   */

  isoString(): string;
}
