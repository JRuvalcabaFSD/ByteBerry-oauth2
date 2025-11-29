/**
 * Data Transfer Object for creating a new user.
 *
 * @property email - The user's email address.
 * @property password - The user's password.
 * @property username - (Optional) The user's username.
 */

export interface CreateUserRequestDto {
  email: string;
  password: string;
  username?: string;
}

/**
 * Represents the response returned after successfully creating a user.
 *
 * @property userId - The unique identifier of the newly created user.
 * @property email - The email address associated with the user.
 * @property username - The username of the user, or null if not set.
 * @property createdAt - The ISO 8601 timestamp indicating when the user was created.
 */

export interface CreateUserResponseDto {
  userId: string;
  email: string;
  username: string | null;
  createdAt: string;
}

/**
 * Data Transfer Object for user authentication requests.
 *
 * @property email - The user's email address used for authentication.
 * @property password - The user's password used for authentication.
 */

export interface AuthenticateUserRequestDto {
  email: string;
  password: string;
}

/**
 * Represents the response returned after authenticating a user.
 *
 * @property userId - The unique identifier of the authenticated user.
 * @property email - The email address associated with the user.
 * @property username - The username of the user, or null if not set.
 */

export interface AuthenticateUserResponseDto {
  userId: string;
  email: string;
  username: string | null;
}
