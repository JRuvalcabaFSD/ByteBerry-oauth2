import { AuthCodeEntity, ClientIdVO, CodeChallengeVO } from '@domain';

describe('AuthCodeEntity', () => {
	const clientId = ClientIdVO.create('test-client-id-123');
	const codeChallenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should create a valid AuthCodeEntity', () => {
		const authCode = AuthCodeEntity.create({
			code: 'auth-code-123',
			userId: 'user-123',
			clientId,
			redirectUri: 'https://example.com/callback',
			codeChallenge,
			scope: 'read write',
			state: 'random-state',
			expirationMinutes: 5,
		});

		expect(authCode.code).toBe('auth-code-123');
		expect(authCode.userId).toBe('user-123');
		expect(authCode.scope).toBe('read write');
		expect(authCode.isUsed()).toBe(false);
	});

	it('should check if authorization code is expired', () => {
		const now = new Date('2024-01-01T12:00:00Z');
		vi.setSystemTime(now);

		const authCode = AuthCodeEntity.create({
			code: 'auth-code-123',
			userId: 'user-123',
			clientId,
			redirectUri: 'https://example.com/callback',
			codeChallenge,
			expirationMinutes: 5,
		});

		expect(authCode.isExpired()).toBe(false);

		vi.setSystemTime(new Date('2024-01-01T12:06:00Z'));
		expect(authCode.isExpired()).toBe(true);
	});

	it('should mark authorization code as used', () => {
		const authCode = AuthCodeEntity.create({
			code: 'auth-code-123',
			userId: 'user-123',
			clientId,
			redirectUri: 'https://example.com/callback',
			codeChallenge,
		});

		expect(authCode.isUsed()).toBe(false);

		authCode.markAsUsed();

		expect(authCode.isUsed()).toBe(true);
	});

	it('should check if authorization code is valid', () => {
		const authCode = AuthCodeEntity.create({
			code: 'auth-code-123',
			userId: 'user-123',
			clientId,
			redirectUri: 'https://example.com/callback',
			codeChallenge,
			expirationMinutes: 5,
		});

		expect(authCode.isValid()).toBe(true);

		authCode.markAsUsed();
		expect(authCode.isValid()).toBe(false);
	});
});
