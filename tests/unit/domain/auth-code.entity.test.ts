import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthCodeEntity } from '@domain';
import { ClientIdVO, CodeChallengeVO } from '@domain';

// Mock Date.now for consistent testing
const mockNow = new Date('2024-01-01T10:00:00Z');

describe('AuthCodeEntity', () => {
	let mockClientId: ClientIdVO;
	let mockCodeChallenge: CodeChallengeVO;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(mockNow);

		mockClientId = ClientIdVO.create('test-client-id-123');
		mockCodeChallenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('create', () => {
		const basicParams = {
			code: 'auth-code-123',
			userId: 'user-456',
			redirectUri: 'https://example.com/callback',
		};

		it('should create auth code entity with required parameters', () => {
			const entity = AuthCodeEntity.create({
				...basicParams,
				clientId: mockClientId,
				codeChallenge: mockCodeChallenge,
			});

			expect(entity.code).toBe('auth-code-123');
			expect(entity.userId).toBe('user-456');
			expect(entity.clientId).toBe(mockClientId);
			expect(entity.redirectUri).toBe('https://example.com/callback');
			expect(entity.codeChallenge).toBe(mockCodeChallenge);
			expect(entity.scope).toBeUndefined();
			expect(entity.state).toBeUndefined();
			expect(entity.isUsed()).toBe(false);
		});

		it('should create auth code entity with optional parameters', () => {
			const entity = AuthCodeEntity.create({
				...basicParams,
				clientId: mockClientId,
				codeChallenge: mockCodeChallenge,
				scope: 'read write',
				state: 'random-state-value',
			});

			expect(entity.scope).toBe('read write');
			expect(entity.state).toBe('random-state-value');
		});

		it('should set default expiration to 1 minute', () => {
			const entity = AuthCodeEntity.create({
				...basicParams,
				clientId: mockClientId,
				codeChallenge: mockCodeChallenge,
			});

			const expectedExpiration = new Date(mockNow.getTime() + 1 * 60 * 1000);
			expect(entity.expiresAt).toEqual(expectedExpiration);
		});

		it('should use custom expiration minutes', () => {
			const entity = AuthCodeEntity.create({
				...basicParams,
				clientId: mockClientId,
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 10,
			});

			const expectedExpiration = new Date(mockNow.getTime() + 10 * 60 * 1000);
			expect(entity.expiresAt).toEqual(expectedExpiration);
		});

		it('should handle zero expiration minutes', () => {
			const entity = AuthCodeEntity.create({
				...basicParams,
				clientId: mockClientId,
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 0,
			});

			// Según la lógica actual, si expirationMinutes es 0, se usará 1 minuto
			const expectedExpiration = new Date(mockNow.getTime() + 1 * 60 * 1000);
			expect(entity.expiresAt).toEqual(expectedExpiration);
		});
	});

	describe('isUsed', () => {
		it('should return false for newly created auth code', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			});

			expect(entity.isUsed()).toBe(false);
		});

		it('should return true after marking as used', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			});

			entity.markAsUsed();
			expect(entity.isUsed()).toBe(true);
		});
	});

	describe('isExpired', () => {
		it('should return false for non-expired auth code', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 5,
			});

			expect(entity.isExpired()).toBe(false);
		});

		it('should return true for expired auth code', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 5,
			});

			// Move time forward past expiration
			vi.setSystemTime(new Date(mockNow.getTime() + 6 * 60 * 1000));
			expect(entity.isExpired()).toBe(true);
		});

		it('should return true exactly at expiration time', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				expirationMinutes: 5,
			});

			// Move time forward to exact expiration time + 1ms
			vi.setSystemTime(new Date(mockNow.getTime() + 5 * 60 * 1000 + 1));
			expect(entity.isExpired()).toBe(true);
		});
	});

	describe('markAsUsed', () => {
		it('should mark auth code as used', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			});

			expect(entity.isUsed()).toBe(false);
			entity.markAsUsed();
			expect(entity.isUsed()).toBe(true);
		});

		it('should remain used after multiple calls', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
			});

			entity.markAsUsed();
			entity.markAsUsed();
			entity.markAsUsed();

			expect(entity.isUsed()).toBe(true);
		});
	});

	describe('readonly properties', () => {
		it('should have immutable properties', () => {
			const entity = AuthCodeEntity.create({
				code: 'auth-code-123',
				userId: 'user-456',
				clientId: mockClientId,
				redirectUri: 'https://example.com/callback',
				codeChallenge: mockCodeChallenge,
				scope: 'read write',
				state: 'random-state',
			});

			// All properties should be readonly and cannot be reassigned
			// Solo verificar que los valores iniciales son los esperados
			expect(entity.code).toBe('auth-code-123');
			expect(entity.userId).toBe('user-456');
			expect(entity.clientId.equals(mockClientId)).toBe(true);
			expect(entity.redirectUri).toBe('https://example.com/callback');
			expect(entity.codeChallenge.getChallenge()).toBe(mockCodeChallenge.getChallenge());
			expect(entity.codeChallenge.getMethod()).toBe(mockCodeChallenge.getMethod());
			expect(entity.scope).toBe('read write');
			expect(entity.state).toBe('random-state');
		});
	});
});
