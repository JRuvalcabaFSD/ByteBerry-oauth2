/**
 * Represents a clock service that provides time-related utilities.
 *
 * @interface IClock
 *
 * @remarks
 * This interface defines a contract for services that need to provide
 * time information in various formats. It's useful for testing scenarios
 * where time needs to be mocked or controlled.
 *
 * @example
 * ```typescript
 * class SystemClock implements IClock {
 *   now(): Date {
 *     return new Date();
 *   }
 *
 *   timestamp(): number {
 *     return Date.now();
 *   }
 *
 *   isoString(): string {
 *     return new Date().toISOString();
 *   }
 * }
 * ```
 */

export interface IClock {
	now(): Date;
	timestamp(): number;
	isoString(): string;
}
