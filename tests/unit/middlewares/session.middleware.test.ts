import { createSessionMiddleware } from '@infrastructure';
import type { Request, Response, NextFunction } from 'express';
import type { ISessionRepository, ILogger } from '@interfaces';
import { SessionEntity } from '@domain';

describe('SessionMiddleware', () => {
	let repository: ISessionRepository;
	let logger: ILogger;
	let middleware: ReturnType<typeof createSessionMiddleware>;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		repository = {
			save: vi.fn(),
			findById: vi.fn(),
			deleteById: vi.fn(),
			deleteByUserId: vi.fn(),
			cleanup: vi.fn(),
			findByUserId: vi.fn(),
			countByUserId: vi.fn(),
			getAuditTrail: vi.fn(),
		};

		logger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		middleware = createSessionMiddleware(repository, logger);

		req = {
			cookies: {},
			path: '/test',
			method: 'GET',
			originalUrl: '/test',
		};

		res = {
			redirect: vi.fn(),
		};

		next = vi.fn();
	});

	it('should redirect to login when no session cookie', async () => {
		req.cookies = {};

		await middleware(req as Request, res as Response, next);

		expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
		expect(next).not.toHaveBeenCalled();
	});

	it('should redirect to login when session not found', async () => {
		req.cookies = { session_id: 'non-existent-session' };
		vi.mocked(repository.findById).mockResolvedValue(null);

		await middleware(req as Request, res as Response, next);

		expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
		expect(logger.warn).toHaveBeenCalled();
	});

	it('should redirect to login when session expired', async () => {
		const expiredSession = SessionEntity.create({
			id: 'session-123',
			userId: 'user-123',
			ttlSeconds: -1, // Expired
		});

		req.cookies = { session_id: 'session-123' };
		vi.mocked(repository.findById).mockResolvedValue(expiredSession);

		await middleware(req as Request, res as Response, next);

		expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
		expect(logger.warn).toHaveBeenCalled();
	});

	it('should validate session successfully and attach user', async () => {
		const validSession = SessionEntity.create({
			id: 'session-123',
			userId: 'user-123',
			ttlSeconds: 3600,
		});

		req.cookies = { session_id: 'session-123' };
		vi.mocked(repository.findById).mockResolvedValue(validSession);

		await middleware(req as Request, res as Response, next);

		expect(req.user).toBeDefined();
		expect(req.user?.userId).toBe('user-123');
		expect(next).toHaveBeenCalled();
		expect(res.redirect).not.toHaveBeenCalled();
	});

	it('should handle errors and pass to next', async () => {
		req.cookies = { session_id: 'session-123' };
		const error = new Error('Database error');
		vi.mocked(repository.findById).mockRejectedValue(error);

		await middleware(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(error);
		expect(logger.error).toHaveBeenCalled();
	});
});
