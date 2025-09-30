import { IClock } from '@/interfaces';

/**
 * Service implementation for clock operations providing current date and time functionality.
 *
 * Implements the IClock interface to provide standardized time-related operations
 * including current date retrieval, timestamp generation, and ISO string formatting.
 *
 * @example
 * ```typescript
 * const clockService = new ClockService();
 * const currentDate = clockService.now();
 * const timestamp = clockService.timestamp();
 * const isoString = clockService.isoString();
 * ```
 */

export class ClockService implements IClock {
  /**
   * Returns the current date and time as a Date object.
   * @return {*}  {Date} The current date and time.
   * @memberof ClockService
   */

  public now(): Date {
    return new Date();
  }

  /**
   * Returns the current timestamp in milliseconds since the Unix epoch.
   * @return {*}  {number} The current timestamp in milliseconds.
   * @memberof ClockService
   */

  public timestamp(): number {
    return Date.now();
  }

  /**
   * Returns the current date and time as an ISO 8601 formatted string.
   * @return {*}  {string} The current date and time as an ISO 8601 formatted string.
   * @memberof ClockService
   */

  public isoString(): string {
    return new Date().toISOString();
  }
}

/**
 * Creates a new instance of the clock service.
 * @returns A new clock service instance that implements the IClock interface
 */

export function createClockService(): IClock {
  return new ClockService();
}
