import { SessionEntity } from '@domain';

describe('SessionEntity', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should create a valid SessionEntity', () => {
		const session = SessionEntity.create({
			id: 'session-123',
			userId: 'user-123',
			ttlSeconds: 3600,
			userAgent: 'Mozilla/5.0',
			ipAddress: '192.168.1.1',
			metadata: { loginMethod: 'password' },
		});

		expect(session.id).toBe('session-123');
		expect(session.userId).toBe('user-123');
		expect(session.userAgent).toBe('Mozilla/5.0');
		expect(session.ipAddress).toBe('192.168.1.1');
	});

	it('should check if session is expired', () => {
		const now = new Date('2024-01-01T12:00:00Z');
		vi.setSystemTime(now);

		const session = SessionEntity.create({
			id: 'session-123',
			userId: 'user-123',
			ttlSeconds: 3600,
		});

		expect(session.isExpired()).toBe(false);

		// Avanzar el tiempo 2 horas
		vi.setSystemTime(new Date('2024-01-01T14:00:01Z'));
		expect(session.isExpired()).toBe(true);
	});

	it('should check if session is valid', () => {
		const now = new Date('2024-01-01T12:00:00Z');
		vi.setSystemTime(now);

		const session = SessionEntity.create({
			id: 'session-123',
			userId: 'user-123',
			ttlSeconds: 3600,
		});

		expect(session.isValid()).toBe(true);

		vi.setSystemTime(new Date('2024-01-01T14:00:01Z'));
		expect(session.isValid()).toBe(false);
	});

	it('should extend session expiration', () => {
		const session = SessionEntity.create({
			id: 'session-123',
			userId: 'user-123',
			ttlSeconds: 3600,
		});

		const extendedSession = session.extend(7200);

		expect(extendedSession.id).toBe(session.id);
		expect(extendedSession.expiresAt.getTime()).toBeGreaterThan(session.expiresAt.getTime());
	});

	it('should convert session to object', () => {
		const session = SessionEntity.create({
			id: 'session-123',
			userId: 'user-123',
			ttlSeconds: 3600,
			userAgent: 'Mozilla/5.0',
		});

		const sessionObject = session.toObject();

		expect(sessionObject).toHaveProperty('id');
		expect(sessionObject).toHaveProperty('userId');
		expect(sessionObject).toHaveProperty('createdAt');
		expect(sessionObject).toHaveProperty('expiresAt');
	});
});
