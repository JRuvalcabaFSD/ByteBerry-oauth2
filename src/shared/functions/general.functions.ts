/**
 * Extracts an error message from an unknown error value.
 *
 * @param error - The error value to extract a message from. Can be of any type.
 * @returns A string representation of the error. If the error is an instance of Error,
 * returns its message property. Otherwise, converts the error to a string.
 *
 * @example
 * ```ts
 * try {
 *   throw new Error("Something went wrong");
 * } catch (error) {
 *   const message = getErrMsg(error); // Returns: "Something went wrong"
 * }
 * ```
 */

export function getErrMsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
