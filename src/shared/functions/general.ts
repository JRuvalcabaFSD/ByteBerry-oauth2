/**
 * Extracts a human-readable message from an arbitrary value that may represent an error.
 *
 * If the provided value is an instance of Error, the function returns its `message` property.
 * Otherwise the value is coerced to a string using `String(value)`.
 *
 * @param error - The value that may represent an error (e.g., `Error`, string, `null`, `undefined`, etc.).
 * @returns A string describing the error. For `null`/`undefined` the result will be `"null"`/`"undefined"`; for `Error` instances the `message` is returned.
 *
 * @example
 * getErrorMessage(new Error("Failed to load")); // "Failed to load"
 *
 * @example
 * getErrorMessage("Something went wrong"); // "Something went wrong"
 */

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
