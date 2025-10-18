import { IClock } from '@/interfaces';

/**
 * Concrete implementation of IClock that provides current-time utilities.
 *
 * This service is a thin wrapper around the global Date APIs to make time access
 * explicit and easy to mock or replace in tests.
 *
 * Methods:
 * - now(): Date — returns a new Date instance representing the current local date/time.
 * - timestamp(): number — returns the current epoch time in milliseconds (Date.now()).
 * - isoString(): string — returns a human-readable date string using Date.prototype.toDateString().
 *
 * Note: despite the method name, isoString() does not return an ISO-8601 string.
 * If an ISO-8601 representation is required, use Date.prototype.toISOString() or
 * change the implementation accordingly.
 *
 * @public
 * @implements {IClock}
 *
 * @example
 * const clock = new ClockService();
 * const currentDate = clock.now();        // Date
 * const msSinceEpoch = clock.timestamp(); // number
 * const dateString = clock.isoString();   // e.g. "Mon Jun 16 2025"
 */

export class ClockService implements IClock {
  /**
   * Returns the current date and time according to the system clock.
   *
   * The returned value is a new Date instance representing the exact moment this method was called.
   * Callers may modify the returned Date without affecting any internal state.
   *
   * @returns A new Date object set to the current system date and time.
   */

  public now(): Date {
    return new Date();
  }

  /**
   * Returns the current timestamp in milliseconds since the UNIX epoch (January 1, 1970 UTC).
   *
   * The value is obtained from the system clock (Date.now()) and can be affected by
   * system time changes, so it is not guaranteed to be monotonic. For high-resolution
   * or monotonic interval measurements, prefer performance.now().
   *
   * @returns The current time in milliseconds since the UNIX epoch.
   */

  public timestamp(): number {
    return Date.now();
  }

  /**
   * Returns the current date as a human-readable string using Date.prototype.toDateString().
   *
   * Note: despite the method name `isoString`, this returns the result of `toDateString()` and
   * does not produce an ISO 8601 formatted string (see Date.prototype.toISOString()).
   *
   * @returns The current date as a string formatted by `toDateString()`, e.g. "Fri Oct 17 2025".
   */

  public isoString(): string {
    return new Date().toDateString();
  }
}

/**
 * Creates and returns a new ClockService instance.
 *
 * Factory function that produces a fresh ClockService configured with default behavior.
 * Each call returns an isolated instance suitable for runtime use or for supplying a
 * controllable clock in tests.
 *
 * @returns A newly constructed ClockService instance.
 */

export const createClockService = () => new ClockService();
