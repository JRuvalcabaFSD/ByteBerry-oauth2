import { SessionEntity } from '@domain';

/**
 * Interface for session repository operations.
 *
 * Provides methods to manage session entities, including creation, retrieval, deletion,
 * cleanup, and audit trail access. Implementations are responsible for persisting session data.
 *
 * @interface ISessionRepository
 *
 * @method save - Saves a session entity.
 * @returns Promise<void>	- A promise that resolves when the session is saved.
 * @param session - The session entity to be saved.
 *
 * @method findById - Finds a session by its ID.
 * @param sessionId - The ID of the session to find.
 * @returns Promise<SessionEntity | null> - A promise that resolves to the session entity if found, or null if not found.
 *
 * @method deleteById - Deletes a session by its ID.
 * @param sessionId - The ID of the session to delete.
 * @returns Promise<void> - A promise that resolves when the session is deleted.
 *
 * @method deleteByUserId - Deletes all sessions for a given user ID.
 * @param userId - The ID of the user whose sessions are to be deleted.
 * @returns Promise<void> - A promise that resolves when the sessions are deleted.
 *
 * @method cleanup - Cleans up expired or invalid sessions.
 * @returns Promise<void> - A promise that resolves when the cleanup is complete.
 *
 * @method findByUserId - Finds all sessions for a given user ID.
 * @param userId - The ID of the user whose sessions are to be found.
 * @returns Promise<SessionEntity[]> - A promise that resolves to an array of session entities.
 *
 * @method countByUserId - Counts the number of sessions for a given user ID.
 * @param userId - The ID of the user whose sessions are to be counted.
 * @returns Promise<number> - A promise that resolves to the count of sessions.
 *
 * @method getAuditTrail - Retrieves the audit trail for a specific session.
 * @param sessionId - The ID of the session whose audit trail is to be retrieved.
 * @returns Promise<unknown[]> - A promise that resolves to an array representing the audit trail.
 */

export interface ISessionRepository {
	save(session: SessionEntity): Promise<void>;
	findById(sessionId: string): Promise<SessionEntity | null>;
	deleteById(sessionId: string): Promise<void>;
	deleteByUserId(userId: string): Promise<void>;
	cleanup(): Promise<number>;
	findByUserId(userId: string): Promise<SessionEntity[]>;
	countByUserId(userId: string): Promise<number>;
	getAuditTrail(sessionId: string): Promise<unknown[]>;
}
