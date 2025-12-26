import { TokenController } from '@presentation';
import type { Request, Response, NextFunction } from 'express';
import type { IExchangeTokenUseCase } from '@interfaces';
import { TokenResponseDTO } from '@application';

describe('TokenController', () => {
	let useCase: IExchangeTokenUseCase;
	let controller: TokenController;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		useCase = {
			execute: vi.fn(),
		};

		controller = new TokenController(useCase);

		req = {
			body: {},
		};

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};

		next = vi.fn();
	});

	it('should exchange code for token successfully', async () => {
		req.body = {
			grant_type: 'authorization_code',
			code: 'valid-auth-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id-12345678',
			code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
		};

		const mockResponse = new TokenResponseDTO({
			accessToken: 'jwt-token-xyz',
			expiresIn: 900,
			scope: 'read write',
		});

		vi.mocked(useCase.execute).mockResolvedValue(mockResponse);

		await controller.handle(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			access_token: 'jwt-token-xyz',
			token_type: 'Bearer',
			expires_in: 900,
			scope: 'read write',
		});
	});

	it('should return token response as JSON', async () => {
		req.body = {
			grant_type: 'authorization_code',
			code: 'auth-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'client-12345678',
			code_verifier: 'verifier-12345678901234567890123456789012345678',
		};

		const mockResponse = new TokenResponseDTO({
			accessToken: 'access-token',
			expiresIn: 3600,
			scope: 'admin',
		});

		vi.mocked(useCase.execute).mockResolvedValue(mockResponse);

		await controller.handle(req as Request, res as Response, next);

		const callArg = vi.mocked(res.json).mock.calls[0][0];
		expect(callArg).toHaveProperty('access_token');
		expect(callArg).toHaveProperty('token_type', 'Bearer');
		expect(callArg).toHaveProperty('expires_in');
		expect(callArg).toHaveProperty('scope');
	});

	it('should handle errors and pass to next middleware', async () => {
		req.body = {
			grant_type: 'authorization_code',
			code: 'invalid-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'client-12345678',
			code_verifier: 'verifier-12345678901234567890123456789012345678',
		};

		const error = new Error('Token exchange failed');
		vi.mocked(useCase.execute).mockRejectedValue(error);

		await controller.handle(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.json).not.toHaveBeenCalled();
	});

	it('should validate request body before execution', async () => {
		req.body = {
			grant_type: 'invalid_grant',
		};

		await controller.handle(req as Request, res as Response, next);

		expect(next).toHaveBeenCalled();
		expect(useCase.execute).not.toHaveBeenCalled();
	});
});
