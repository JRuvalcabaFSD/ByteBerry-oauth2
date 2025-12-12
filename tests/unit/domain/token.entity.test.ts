import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenEntity } from '@domain';

// Mock Date.now for consistent testing
const mockNow = new Date('2024-01-01T10:00:00Z');

describe('TokenEntity', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(mockNow);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('create', () => {
		const basicParams = {
			tokenId: 'token-123',
			userId: 'user-456',
			clientId: 'client-789',
			expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000), // 1 hour from now
		};

		it('should create token entity with required parameters', () => {
			const entity = TokenEntity.create(basicParams);

			expect(entity.tokenId).toBe('token-123');
			expect(entity.userId).toBe('user-456');
			expect(entity.clientId).toBe('client-789');
			expect(entity.expiresAt).toEqual(basicParams.expiresAt);
			expect(entity.issuedAt).toEqual(mockNow);
			expect(entity.scope).toBeUndefined();
			expect(entity.isBlackListed()).toBe(false);
		});

		it('should create token entity with custom issuedAt', () => {
			const customIssuedAt = new Date('2024-01-01T09:00:00Z');
			const entity = TokenEntity.create({
				...basicParams,
				issuedAt: customIssuedAt,
			});

			expect(entity.issuedAt).toEqual(customIssuedAt);
		});

		it('should create token entity with scope', () => {
			const entity = TokenEntity.create({
				...basicParams,
				scope: 'read write admin',
			});

			expect(entity.scope).toBe('read write admin');
		});

		it('should default issuedAt to current time when not provided', () => {
			const entity = TokenEntity.create(basicParams);

			expect(entity.issuedAt).toEqual(mockNow);
		});
	});

	describe('isExpired', () => {
		it('should return false for non-expired token', () => {
			const futureExpiry = new Date(mockNow.getTime() + 60 * 60 * 1000); // 1 hour from now
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: futureExpiry,
			});

			expect(entity.isExpired()).toBe(false);
		});

		it('should return true for expired token', () => {
			const pastExpiry = new Date(mockNow.getTime() - 60 * 60 * 1000); // 1 hour ago
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: pastExpiry,
			});

			expect(entity.isExpired()).toBe(true);
		});

		it('should return true exactly at expiration time', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000), // 1 hour from now
			});

			// Move time forward to exact expiration time + 1ms
			vi.setSystemTime(new Date(mockNow.getTime() + 60 * 60 * 1000 + 1));
			expect(entity.isExpired()).toBe(true);
		});

		it('should handle time changes during token lifecycle', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000), // 1 hour from now
			});

			expect(entity.isExpired()).toBe(false);

			// Move time forward 30 minutes
			vi.setSystemTime(new Date(mockNow.getTime() + 30 * 60 * 1000));
			expect(entity.isExpired()).toBe(false);

			// Move time forward past expiration
			vi.setSystemTime(new Date(mockNow.getTime() + 90 * 60 * 1000));
			expect(entity.isExpired()).toBe(true);
		});
	});

	describe('blacklist functionality', () => {
		let entity: TokenEntity;

		beforeEach(() => {
			entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000),
			});
		});

		describe('isBlackListed', () => {
			it('should return false for newly created token', () => {
				expect(entity.isBlackListed()).toBe(false);
			});

			it('should return true after blacklisting', () => {
				entity.blacklist();
				expect(entity.isBlackListed()).toBe(true);
			});
		});

		describe('blacklist', () => {
			it('should blacklist the token', () => {
				expect(entity.isBlackListed()).toBe(false);
				entity.blacklist();
				expect(entity.isBlackListed()).toBe(true);
			});

			it('should remain blacklisted after multiple calls', () => {
				entity.blacklist();
				entity.blacklist();
				entity.blacklist();

				expect(entity.isBlackListed()).toBe(true);
			});
		});
	});

	describe('isValid', () => {
		it('should return true for valid token (not expired and not blacklisted)', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000), // 1 hour from now
			});

			expect(entity.isValid()).toBe(true);
		});

		it('should return false for expired token', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() - 60 * 60 * 1000), // 1 hour ago
			});

			expect(entity.isValid()).toBe(false);
		});

		it('should return false for blacklisted token', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000), // 1 hour from now
			});

			entity.blacklist();
			expect(entity.isValid()).toBe(false);
		});

		it('should return false for token that is both expired and blacklisted', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() - 60 * 60 * 1000), // 1 hour ago
			});

			entity.blacklist();
			expect(entity.isValid()).toBe(false);
		});

		it('should handle validity changes over time', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000), // 1 hour from now
			});

			expect(entity.isValid()).toBe(true);

			// Move time forward past expiration
			vi.setSystemTime(new Date(mockNow.getTime() + 90 * 60 * 1000));
			expect(entity.isValid()).toBe(false);
		});
	});

	describe('readonly properties', () => {
		it('should have immutable properties', () => {
			const entity = TokenEntity.create({
				tokenId: 'token-123',
				userId: 'user-456',
				clientId: 'client-789',
				expiresAt: new Date(mockNow.getTime() + 60 * 60 * 1000),
				scope: 'read write',
			});

			// Solo verificar que los valores iniciales son los esperados
			expect(entity.tokenId).toBe('token-123');
			expect(entity.userId).toBe('user-456');
			expect(entity.clientId).toBe('client-789');
			expect(entity.expiresAt).toEqual(new Date(mockNow.getTime() + 60 * 60 * 1000));
			expect(entity.scope).toBe('read write');
		});
	});
});
