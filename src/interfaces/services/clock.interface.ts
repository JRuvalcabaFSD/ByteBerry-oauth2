/**
 * Interface for the implementation of the CLOCK service
 * @export
 * @interface IClock
 */
export interface IClock {
  now(): Date;
  timestamp(): number;
}
