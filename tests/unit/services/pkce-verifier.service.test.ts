import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PkceVerifierService } from '@application';
import { CodeChallengeVO } from '@domain';
import type { IHashService, ILogger } from '@interfaces';

// Mocks
const mockHashService: IHashService = {
	sha256: vi.fn(),
	verifySha256: vi.fn()
};

const mockLogger: ILogger = {
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	log: vi.fn(),
	child: vi.fn(() => mockLogger)
};

describe('PkceVerifierService', () => {
	let service: PkceVerifierService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new PkceVerifierService(mockHashService, mockLogger);
	});

	describe('verify', () => {
		it('should verify plain code challenge successfully', () => {
			const validChallenge = 'A'.repeat(43);
			const challenge = CodeChallengeVO.create(validChallenge, 'plain');
			const verifier = validChallenge;

			const result = service.verify(challenge, verifier);

			expect(result).toBe(true);
			expect(mockLogger.debug).toHaveBeenCalledWith('PKCE Verification Start', {
				method: 'plain',
				challengeValue: validChallenge,
				verifierLength: 43,
			});
			expect(mockHashService.sha256).not.toHaveBeenCalled();
		});

		it('should fail plain code challenge with wrong verifier', () => {
			const validChallenge = 'B'.repeat(43);
			const challenge = CodeChallengeVO.create(validChallenge, 'plain');
			const verifier = 'wrong-verifier';

			const result = service.verify(challenge, verifier);

			expect(result).toBe(false);
		});

		it('should verify S256 code challenge successfully', () => {
			const challengeValue = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
			const challenge = CodeChallengeVO.create(challengeValue, 'S256');
			const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

			vi.mocked(mockHashService.sha256).mockReturnValue(challengeValue);

			const result = service.verify(challenge, verifier);

			expect(result).toBe(true);
			expect(mockHashService.sha256).toHaveBeenCalledWith(verifier);
			expect(mockLogger.debug).toHaveBeenCalledWith('PKCE Verification Start', expect.any(Object));
			expect(mockLogger.debug).toHaveBeenCalledWith('PKCE S256 Verification', {
				expectedChallenge: challengeValue,
				computedHash: challengeValue,
				match: true,
				expectedLength: challengeValue.length,
				computedLength: challengeValue.length,
			});
		});

		it('should fail S256 code challenge with wrong verifier', () => {
			const challengeValue = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
			const challenge = CodeChallengeVO.create(challengeValue, 'S256');
			const verifier = 'wrong-verifier';
			const computedHash = 'wrong-hash';

			vi.mocked(mockHashService.sha256).mockReturnValue(computedHash);

			const result = service.verify(challenge, verifier);

			expect(result).toBe(false);
			expect(mockHashService.sha256).toHaveBeenCalledWith(verifier);
			expect(mockLogger.warn).toHaveBeenCalledWith('PKCE Verification Failed - Hash Mismatch', {
				expected: challengeValue,
				computed: computedHash,
			});
		});

		it('should log debug information for S256 verification', () => {
			const challengeValue = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
			const challenge = CodeChallengeVO.create(challengeValue, 'S256');
			const verifier = 'test-verifier';
			const computedHash = 'computed-hash';

			vi.mocked(mockHashService.sha256).mockReturnValue(computedHash);

			service.verify(challenge, verifier);

			expect(mockLogger.debug).toHaveBeenCalledWith('PKCE Verification Start', {
				method: 'S256',
				challengeValue: challengeValue,
				verifierLength: verifier.length,
			});

			expect(mockLogger.debug).toHaveBeenCalledWith('PKCE S256 Verification', {
				expectedChallenge: challengeValue,
				computedHash: computedHash,
				match: false,
				expectedLength: challengeValue.length,
				computedLength: computedHash.length,
			});
		});

		it('should handle empty verifier', () => {
			const validChallenge = 'C'.repeat(43);
			const challenge = CodeChallengeVO.create(validChallenge, 'plain');
			const verifier = '';

			const result = service.verify(challenge, verifier);

			expect(result).toBe(false);
		});

		it('should handle special characters in verifier', () => {
			// base64url válido, 43 caracteres
			const challengeValue = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi0123456789-_';
			const challenge = CodeChallengeVO.create(challengeValue, 'plain');
			const verifier = challengeValue;

			const result = service.verify(challenge, verifier);

			expect(result).toBe(true);
		});
	});
});
