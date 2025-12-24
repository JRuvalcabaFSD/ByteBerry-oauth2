import { SessionEntity } from '@domain';
import { ILogger, ISessionRepository } from '@interfaces';

export class InMemorySessionRepository implements ISessionRepository {
	private readonly sessions = new Map<string, SessionEntity>();
	private readonly userSessionsIndex = new Map<string, Set<string>>();
	private cleanupInterval: NodeJS.Timeout | null;

	constructor(
		private readonly logger: ILogger,
		autoCleanupIntervalMs: number = 5 * 60 * 1000
	) {
		this.cleanupInterval = null;
		this.startAutoCleanup(autoCleanupIntervalMs);
	}

	public async save(session: SessionEntity): Promise<void> {
		this.sessions.set(session.id, session);

		if (!this.userSessionsIndex.has(session.userId)) {
			this.userSessionsIndex.set(session.userId, new Set());
		}
		this.userSessionsIndex.get(session.userId)!.add(session.id);

		this.logger.debug('Session saved', {
			sessionId: session.id,
			userId: session.userId,
			expiresAt: session.expiresAt.toISOString(),
		});
	}

	public async findById(sessionId: string): Promise<SessionEntity | null> {
		const session = this.sessions.get(sessionId);

		if (!session) {
			this.logger.debug('Session not found', { sessionId });
			return null;
		}

		if (session.isExpired()) {
			this.logger.debug('Session expired, removing', { sessionId });
			await this.deleteById(sessionId);
			return null;
		}

		this.logger.debug('Session found', {
			sessionId,
			userId: session.userId,
			remainingSeconds: session.getRemainingSeconds(),
		});

		return session;
	}

	public async deleteById(sessionId: string): Promise<void> {
		const session = this.sessions.get(sessionId);

		if (!session) {
			this.logger.debug('Session not found for deletion', { sessionId });
			return;
		}

		this.sessions.delete(sessionId);

		const userSessions = this.userSessionsIndex.get(session.userId);
		if (userSessions) {
			userSessions.delete(sessionId);
			if (userSessions.size === 0) {
				this.userSessionsIndex.delete(session.userId);
			}
		}

		this.logger.info('Session deleted', {
			sessionId,
			userId: session.userId,
		});
	}
	public async deleteByUserId(userId: string): Promise<void> {
		const sessionIds = this.userSessionsIndex.get(userId);

		if (!sessionIds || sessionIds.size === 0) {
			this.logger.debug('No sessions found for user', { userId });
			return;
		}

		const count = sessionIds.size;

		// Delete all user sessions
		for (const sessionId of sessionIds) {
			this.sessions.delete(sessionId);
		}

		// Remove from user index
		this.userSessionsIndex.delete(userId);

		this.logger.info('All user sessions deleted', {
			userId,
			sessionsDeleted: count,
		});
	}
	public async cleanup(): Promise<number> {
		const now = new Date();
		let deletedCount = 0;

		// Find expired sessions
		const expiredSessionIds: string[] = [];

		for (const [sessionId, session] of this.sessions.entries()) {
			if (session.expiresAt <= now) {
				expiredSessionIds.push(sessionId);
			}
		}

		// Delete expired sessions
		for (const sessionId of expiredSessionIds) {
			await this.deleteById(sessionId);
			deletedCount++;
		}

		if (deletedCount > 0) {
			this.logger.info('Expired sessions cleaned up', {
				deletedCount,
				remainingSessions: this.sessions.size,
			});
		}

		return deletedCount;
	}
	public async findByUserId(_userId: string): Promise<SessionEntity[]> {
		throw new Error('Method not implemented.');
	}
	public async countByUserId(_userId: string): Promise<number> {
		throw new Error('Method not implemented.');
	}
	public async getAuditTrail(_sessionId: string): Promise<unknown[]> {
		throw new Error('Method not implemented.');
	}

	public stopAutoCleanup(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
			this.logger.debug('Auto cleanup stopped');
		}
	}

	public getStats(): {
		totalSessions: number;
		totalUsers: number;
		expiredSessions: number;
	} {
		const now = new Date();
		let expiredCount = 0;

		for (const session of this.sessions.values()) {
			if (session.expiresAt <= now) {
				expiredCount++;
			}
		}

		return {
			totalSessions: this.sessions.size,
			totalUsers: this.userSessionsIndex.size,
			expiredSessions: expiredCount,
		};
	}

	public async clear(): Promise<void> {
		this.sessions.clear();
		this.userSessionsIndex.clear();
		this.logger.warn('All sessions cleared');
	}

	private startAutoCleanup(intervalMs: number) {
		this.cleanupInterval = setInterval(() => {
			void this.cleanup();
		}, intervalMs);

		this.logger.debug('Auto cleanup started', {
			intervalMs,
		});
	}
}
