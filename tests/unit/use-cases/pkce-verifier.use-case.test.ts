import { PkceVerifierUseCase } from '@application';
import { CodeChallengeVO } from '@domain';
import { IHashService, ILogger } from '@interfaces';

describe('PkceVerifierUseCase', () => {
	let hashService: IHashService;
	let logger: ILogger;
	let useCase: PkceVerifierUseCase;

	beforeEach(() => {
		hashService = {
			verifySha256: vi.fn(),
		};

		logger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		useCase = new PkceVerifierUseCase(hashService, logger);
	});

	it('should verify plain PKCE challenge correctly', () => {
		const challenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'plain');
		const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

		const result = useCase.verify(challenge, verifier);

		expect(result).toBe(true);
		expect(logger.debug).toHaveBeenCalled();
	});

	it('should verify S256 PKCE challenge correctly', () => {
		const challenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
		const verifier = 'test-verifier';

		vi.mocked(hashService.verifySha256).mockReturnValue(true);

		const result = useCase.verify(challenge, verifier);

		expect(result).toBe(true);
		expect(hashService.verifySha256).toHaveBeenCalledWith(verifier, challenge.getChallenge());
	});

	it('should return false for invalid S256 verification', () => {
		const challenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
		const verifier = 'wrong-verifier';

		vi.mocked(hashService.verifySha256).mockReturnValue(false);

		const result = useCase.verify(challenge, verifier);

		expect(result).toBe(false);
		expect(logger.warn).toHaveBeenCalled();
	});

	it('should log debug information during verification', () => {
		const challenge = CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');
		const verifier = 'test-verifier';

		vi.mocked(hashService.verifySha256).mockReturnValue(true);

		useCase.verify(challenge, verifier);

		expect(logger.debug).toHaveBeenCalledWith('[PkceVerifierUseCase.verify] PKCE verification start', expect.any(Object));
	});
});
