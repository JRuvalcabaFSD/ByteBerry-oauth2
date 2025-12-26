import { JwksController } from '@presentation';
import type { Request, Response, NextFunction } from 'express';
import type { IGetJwksUseCase, JwksResponse } from '@interfaces';

describe('JwksController', () => {
	let useCase: IGetJwksUseCase;
	let controller: JwksController;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;

	beforeEach(() => {
		useCase = {
			execute: vi.fn(),
		};

		controller = new JwksController(useCase);

		req = {};

		res = {
			set: vi.fn(),
			json: vi.fn(),
		};

		next = vi.fn();
	});

	it('should return JWKS with correct headers', async () => {
		const mockJwks: JwksResponse = {
			keys: [
				{
					kty: 'RSA',
					kid: 'key-1',
					use: 'sig',
					alg: 'RS256',
					n: 'modulus-value',
					e: 'AQAB',
				},
			],
		};

		vi.mocked(useCase.execute).mockResolvedValue(mockJwks);

		await controller.handle(req as Request, res as Response, next);

		expect(res.set).toHaveBeenCalledWith({
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600',
			'X-Content-Type-Options': 'nosniff',
		});
		expect(res.json).toHaveBeenCalledWith(mockJwks);
	});

	it('should set cache control headers', async () => {
		const mockJwks: JwksResponse = {
			keys: [],
		};

		vi.mocked(useCase.execute).mockResolvedValue(mockJwks);

		await controller.handle(req as Request, res as Response, next);

		expect(res.set).toHaveBeenCalledWith(
			expect.objectContaining({
				'Cache-Control': 'public, max-age=3600',
			})
		);
	});

	it('should handle service errors', async () => {
		const error = new Error('JWKS generation failed');
		vi.mocked(useCase.execute).mockRejectedValue(error);

		await controller.handle(req as Request, res as Response, next);

		expect(next).toHaveBeenCalledWith(error);
		expect(res.json).not.toHaveBeenCalled();
	});
});
