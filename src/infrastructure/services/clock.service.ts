import { IClock } from '@/interfaces';

/**
 * Clock service implementation for time operations
 * @export
 * @class ClockService
 * @implements {IClock}
 */
export class ClockService implements IClock {
  /**
   * Get current date
   * @return {*}  {Date}
   * @memberof ClockService
   */
  now(): Date {
    return new Date();
  }

  /**
   * Get current timestamp
   * @return {*}  {number}
   * @memberof ClockService
   */
  timestamp(): number {
    return Date.now();
  }
}
