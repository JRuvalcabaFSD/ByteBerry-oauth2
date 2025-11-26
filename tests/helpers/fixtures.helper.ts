/**
 * Fixtures Helper - Factory functions para crear datos de prueba
 *
 * Proporciona funciones helper para crear entities de dominio
 * con valores por defecto razonables para tests.
 *
 * @module helpers/fixtures-helper
 */

import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { ClientId, CodeChallenge, UserEntity } from '@domain';
import { OAuthClientEntity } from '@domain';
import { AuthorizationCodeEntity } from '@domain';

/**
 * Opciones para crear un usuario de prueba
 */
export interface CreateTestUserOptions {
  id?: string;
  email?: string;
  username?: string | null;
  password?: string;
  passwordHash?: string;
  createdAt?: Date;
}

/**
 * Crea una entidad User para tests
 *
 * @param {CreateTestUserOptions} [options] - Opciones opcionales para personalizar el usuario
 * @returns {Promise<UserEntity>} Entidad User lista para usar
 *
 * @example
 * ```typescript
 * const user = await createTestUser({
 *   email: 'john@example.com',
 *   username: 'johndoe'
 * });
 * ```
 */
export async function createTestUser(options: CreateTestUserOptions = {}): Promise<UserEntity> {
  const {
    id = randomUUID(),
    email = `test-${randomUUID().slice(0, 8)}@example.com`,
    username = `testuser-${randomUUID().slice(0, 8)}`,
    password = 'TestPassword123!',
    passwordHash,
    createdAt = new Date(),
  } = options;

  // Si se proporciona passwordHash, usarlo; si no, hashear el password
  const finalPasswordHash = passwordHash || (password ? await bcrypt.hash(password, 10) : null);

  return UserEntity.create({
    id,
    email,
    username,
    passwordHash: finalPasswordHash,
    createdAt,
  });
}

/**
 * Opciones para crear un cliente OAuth2 de prueba
 */
export interface CreateTestOAuthClientOptions {
  id?: string;
  clientId?: string;
  clientSecret?: string | null;
  clientName?: string;
  redirectUris?: string[];
  grantTypes?: string[];
  isPublic?: boolean;
  createdAt?: Date;
}

/**
 * Crea una entidad OAuthClient para tests
 *
 * @param {CreateTestOAuthClientOptions} [options] - Opciones opcionales
 * @returns {OAuthClientEntity} Entidad OAuthClient lista para usar
 *
 * @example
 * ```typescript
 * const client = createTestOAuthClient({
 *   clientName: 'My Test App',
 *   redirectUris: ['http://localhost:3000/callback']
 * });
 * ```
 */
export function createTestOAuthClient(options: CreateTestOAuthClientOptions = {}): OAuthClientEntity {
  const {
    id = randomUUID(),
    clientId = `test-client-${randomUUID().slice(0, 8)}`,
    clientSecret = null, // Por defecto public client (PKCE)
    clientName = `Test OAuth Client ${randomUUID().slice(0, 8)}`,
    redirectUris = ['http://localhost:3000/callback'],
    grantTypes = ['authorization_code', 'refresh_token'],
    isPublic = true,
    createdAt = new Date(),
  } = options;

  return OAuthClientEntity.create({
    id,
    clientId,
    clientSecret,
    clientName,
    redirectUris,
    grantTypes,
    isPublic,
    createdAt,
  });
}

/**
 * Opciones para crear un código de autorización de prueba
 */
export interface CreateTestAuthCodeOptions {
  id?: string;
  code?: string;
  clientId?: string;
  userId?: string;
  redirectUri?: string;
  scopes?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: string;
  expiresAt?: Date;
  used?: boolean;
  state?: string | null;
  createdAt?: Date;
}

/**
 * Crea una entidad AuthorizationCode para tests
 *
 * @param {CreateTestAuthCodeOptions} [options] - Opciones opcionales
 * @returns {AuthorizationCodeEntity} Entidad AuthorizationCode lista para usar
 *
 * @example
 * ```typescript
 * const authCode = createTestAuthCode({
 *   clientId: 'my-client-id',
 *   userId: 'user-123',
 *   codeChallenge: 'challenge-hash'
 * });
 * ```
 */
export function createTestAuthCode(options: CreateTestAuthCodeOptions = {}): AuthorizationCodeEntity {
  const {
    code = `TEST_CODE_${randomUUID()}`,
    clientId = `test-client-${randomUUID().slice(0, 8)}`,
    userId = randomUUID(),
    redirectUri = 'http://localhost:3000/callback',
    codeChallenge = `challenge-${randomUUID()}`,
    state = null,
  } = options;

  return AuthorizationCodeEntity.create({
    code,
    clientId: ClientId.create(clientId),
    userId,
    redirectUri,
    codeChallenge: CodeChallenge.create(codeChallenge, 'S256'),
    // Si tu entidad espera 'scope' como string, usa: scope: scopes.join(' ')
    // Si espera 'scopes' como array, usa: scopes,
    // Si espera 'expirationMinutes', calcula y pásalo aquí
    state: state ?? undefined,
    // Elimina id, createdAt, used, expiresAt, codeChallengeMethod si no son parte del contrato
  });
}

/**
 * Genera un code_verifier PKCE válido para tests
 *
 * @returns {string} Code verifier de 43 caracteres
 *
 * @example
 * ```typescript
 * const verifier = generateTestPKCEVerifier();
 * const challenge = await generatePKCEChallenge(verifier);
 * ```
 */
export function generateTestPKCEVerifier(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < 43; i++) {
    verifier += chars[Math.floor(Math.random() * chars.length)];
  }
  return verifier;
}

/**
 * Genera un code_challenge PKCE a partir de un verifier
 *
 * @param {string} verifier - Code verifier
 * @returns {Promise<string>} Code challenge (SHA-256 hash base64url)
 *
 * @example
 * ```typescript
 * const verifier = generateTestPKCEVerifier();
 * const challenge = await generateTestPKCEChallenge(verifier);
 * ```
 */
export async function generateTestPKCEChallenge(verifier: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(verifier).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
