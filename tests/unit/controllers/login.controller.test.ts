import { LoginController } from '@presentation';
import type { Request, Response, NextFunction } from 'express';
import type { ILoginUseCase, ILogger, IConfig } from '@interfaces';
import { LoginResponseDTO } from '@application';

describe('LoginController', () => {
	let useCase: ILoginUseCase;
	let logger: ILogger;
	let config: IConfig;
	let controller: LoginController;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		useCase = {
			execute: vi.fn(),
		};

		logger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		config = {
			version: '1.0.0',
			serviceUrl: 'http://localhost:4000',
			isProduction: vi.fn().mockReturnValue(false),
		} as unknown as IConfig;

		controller = new LoginController(useCase, logger, config);

		req = {
			body: {},
			query: {},
			cookies: {},
			ip: '127.0.0.1',
		};

		res = {
			render: vi.fn(),
			set: vi.fn(),
			cookie: vi.fn().mockReturnThis(),
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
			redirect: vi.fn(),
		};

		next = vi.fn();
	});

	it('should render login form with nonce', async () => {
		await controller.getLoginForm(req as Request, res as Response, next);

		expect(res.set).toHaveBeenCalledWith(
			'Content-Security-Policy',
			expect.stringContaining("script-src 'self' 'nonce-")
		);
		expect(res.render).toHaveBeenCalledWith('login', expect.objectContaining({
			version: '1.0.0',
			nonce: expect.any(String),
		}));
	});

	it('should process login successfully and set cookie', async () => {
		req.body = {
			emailOrUserName: 'test@example.com',
			password: 'password123',
			rememberMe: 'false',
		};

		const mockResponse = new LoginResponseDTO({
			sessionId: 'session-id-123',
			user: {
				id: 'user-123',
				email: 'test@example.com',
				username: 'testuser',
				fullName: null,
				roles: ['user'],
			},
			expiresAt: new Date(Date.now() + 3600000),
			message: 'Login successful',
		});

		vi.mocked(useCase.execute).mockResolvedValue(mockResponse);

		await controller.login(req as Request, res as Response, next);

		expect(res.cookie).toHaveBeenCalledWith(
			'session_id',
			expect.any(String),
			expect.objectContaining({
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				maxAge: 3600000,
				path: '/',
			})
		);
		// Si no hay return_url, debe responder con status 200
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.redirect).not.toHaveBeenCalled();
	});

	it('should handle login errors', async () => {
		req.body = {
			emailOrUserName: 'wrong@example.com',
			password: 'wrongpassword',
		};

		const error = new Error('Invalid credentials');
		vi.mocked(useCase.execute).mockRejectedValue(error);

		await controller.login(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(error);
	});

	it('should redirect to return_url after login when provided', async () => {
		req.body = {
			emailOrUserName: 'test@example.com',
			password: 'password123',
			return_url: '/authorize?client_id=abc',
		};

		const mockResponse = new LoginResponseDTO({
			sessionId: 'session-id-123',
			user: {
				id: 'user-123',
				email: 'test@example.com',
				username: 'testuser',
				fullName: null,
				roles: ['user'],
			},
			expiresAt: new Date(Date.now() + 3600000),
			message: 'Login successful',
		});

		vi.mocked(useCase.execute).mockResolvedValue(mockResponse);

		await controller.login(req as Request, res as Response, next);

		expect(res.cookie).toHaveBeenCalledWith(
			'session_id',
			expect.any(String),
			expect.objectContaining({
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				maxAge: 3600000,
				path: '/',
			})
		);
		expect(res.redirect).toHaveBeenCalledWith('/authorize?client_id=abc');
		// Si hay return_url, no debe responder con status 200
		expect(res.status).not.toHaveBeenCalledWith(200);
	});

	it('should handle rememberMe flag correctly', async () => {
		req.body = {
			emailOrUserName: 'test@example.com',
			password: 'password123',
			rememberMe: 'true',
		};

		const mockResponse = new LoginResponseDTO({
			sessionId: 'session-id-123',
			user: {
				id: 'user-123',
				email: 'test@example.com',
				username: 'testuser',
				fullName: null,
				roles: ['user'],
			},
			expiresAt: new Date(Date.now() + 30 * 24 * 3600000),
			message: 'Login successful',
		});

		vi.mocked(useCase.execute).mockResolvedValue(mockResponse);

		await controller.login(req as Request, res as Response, next);

		expect(res.cookie).toHaveBeenCalledWith(
			'session_id',
			'session-id-123',
			expect.objectContaining({
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				maxAge: 30 * 24 * 3600000,
				path: '/',
			})
		);
	});
});
