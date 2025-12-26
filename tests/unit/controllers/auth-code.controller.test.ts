// Utilidad para obtener el argumento de redirect de forma segura
function getRedirectUrl(mockFn: any): string {
    // Usamos el helper de Vitest para tratarlo como un mock
    const mockedMethod = vi.mocked(mockFn);

    // Verificamos si realmente tiene la estructura de un mock de Vitest
    if (!mockedMethod.mock || !mockedMethod.mock.calls.length) {
        return '';
    }

    // Buscamos en las llamadas el argumento que sea una URL
    const firstCall = mockedMethod.mock.calls[0];
    const urlArg = firstCall.find((arg: string) => typeof arg === 'string' && arg.startsWith('http'));

    return typeof urlArg === 'string' ? urlArg : '';
}

import { AuthCodeController } from '@presentation';
import type { Request, Response, NextFunction } from 'express';
import type { IGenerateAuthCodeUseCase } from '@interfaces';
import { AuthCodeResponseDTO } from '@application';
import { InvalidAuthCodeError } from '@shared';

describe('AuthCodeController', () => {
	let useCase: IGenerateAuthCodeUseCase;
	let controller: AuthCodeController;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		useCase = {
			execute: vi.fn(),
		};

		controller = new AuthCodeController(useCase);

		req = {
			query: {},
			user: undefined,
		};

		res = {
			redirect: vi.fn(),
		};

		next = vi.fn();
	});

	it('should generate auth code and redirect successfully', async () => {
		req.query = {
			client_id: 'test-client-id-12345678',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
			state: 'random-state',
		};

		req.user = { userId: 'user-123', sessionId: 'session-abc' };

		const mockResponse = new AuthCodeResponseDTO('generated-auth-code', 'random-state');
		vi.mocked(useCase.execute).mockResolvedValue(mockResponse);

		await controller.handle(req as Request, res as Response, next);

		expect(res.redirect).toHaveBeenCalledTimes(1);
		const redirectUrl = getRedirectUrl(res.redirect);
		expect(redirectUrl).toContain('code=generated-auth-code');
		expect(redirectUrl).toContain('state=random-state');
	});

	it('should throw error when user not authenticated', async () => {
		req.query = {
			client_id: 'test-client-id-12345678',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
		};

		req.user = undefined; // Not authenticated

		await controller.handle(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(expect.any(InvalidAuthCodeError));
		expect(res.redirect).not.toHaveBeenCalled();
	});

	it('should handle OAuth errors and pass to next', async () => {
		req.query = {
			client_id: 'invalid-client',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
		};

		req.user = { userId: 'user-123', sessionId: 'session-abc' };

		const error = new Error('Client validation failed');
		vi.mocked(useCase.execute).mockRejectedValue(error);

		await controller.handle(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(error);
	});

	it('should pass state parameter to redirect URL', async () => {
		req.query = {
			client_id: 'test-client-id-12345678',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
			state: 'custom-state-xyz',
		};

		req.user = { userId: 'user-123', sessionId: 'session-abc' };

		const mockResponse = new AuthCodeResponseDTO('auth-code', 'custom-state-xyz');
		vi.mocked(useCase.execute).mockResolvedValue(mockResponse);

		await controller.handle(req as Request, res as Response, next);

		expect(res.redirect).toHaveBeenCalledTimes(1);
		const redirectUrl2 = getRedirectUrl(res.redirect);
		expect(redirectUrl2).toContain('state=custom-state-xyz');
	});
});
