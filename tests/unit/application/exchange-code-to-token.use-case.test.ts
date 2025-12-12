import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExchangeCodeForTokenUseCase } from '@application';
import { AuthCodeEntity, ClientIdVO, CodeChallengeVO, TokenEntity } from '@domain';
import { InvalidGrantError, InvalidRequestError } from '@shared';
import type {
	IAuthCodeRepository,
	ITokenRepository,
	ILogger,
	IJwtService,
	IPKceVerifierService
} from '@interfaces';

// Mocks
const mockCodeRepository: IAuthCodeRepository = {
	findByCode: vi.fn(),
	save: vi.fn(),
	cleanup: vi.fn()
};

const mockTokenRepository: ITokenRepository = {
	saveToken: vi.fn(),
	findByTokenId: vi.fn(),
	isBlacklisted: vi.fn(),
	blacklistToken: vi.fn()
};

const mockLogger: ILogger = {
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	log: vi.fn(),
	child: vi.fn(() => mockLogger)
};

const mockJwtService: IJwtService = {
	generateAccessToken: vi.fn(),
	verifyToken: vi.fn(),
	decodeToken: vi.fn()
};

const mockPkceVerifier: IPKceVerifierService = {
	verify: vi.fn()
};

describe('ExchangeCodeForTokenUseCase', () => {
	let useCase: ExchangeCodeForTokenUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new ExchangeCodeForTokenUseCase(
			mockCodeRepository,
			mockTokenRepository,
			mockLogger,
			mockJwtService,
			mockPkceVerifier
		);
	});

	describe('execute', () => {
		const validRequest = {
			grant_type: 'authorization_code',
			code: 'test-auth-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id',
			code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
		};

		it('should successfully exchange code for token', async () => {
			// Setup
			const clientId = ClientIdVO.create('test-client-id');
			const codeChallenge = CodeChallengeVO.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
			const authCode = AuthCodeEntity.create({
				code: 'test-auth-code',
				clientId,
				userId: 'test-user',
				redirectUri: 'https://example.com/callback',
				codeChallenge,
				expirationMinutes: 5,
				scope: 'read write'
			});

			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(authCode);
			vi.mocked(mockPkceVerifier.verify).mockReturnValue(true);
			vi.mocked(mockJwtService.generateAccessToken).mockReturnValue('jwt-access-token');

			// Execute
			const result = await useCase.execute(validRequest);

			// Verify
			expect(result).toEqual({
				access_token: 'jwt-access-token',
				token_type: 'Bearer',
				expires_in: 900,
				scope: 'read write'
			});

			expect(mockCodeRepository.findByCode).toHaveBeenCalledWith('test-auth-code');
			expect(mockPkceVerifier.verify).toHaveBeenCalledWith(codeChallenge, expect.any(String));
			expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
				sub: 'test-client-id',
				scope: 'read write',
				client_id: 'test-client-id'
			});
			expect(mockCodeRepository.save).toHaveBeenCalledWith(authCode);
			expect(mockTokenRepository.saveToken).toHaveBeenCalled();
		});

		it('should return token without scope when authCode has no scope', async () => {
			// Setup
			const clientId = ClientIdVO.create('test-client-id');
			const codeChallenge = CodeChallengeVO.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
			const authCode = AuthCodeEntity.create({
				code: 'test-auth-code',
				clientId,
				userId: 'test-user',
				redirectUri: 'https://example.com/callback',
				codeChallenge,
				expirationMinutes: 5
				// No scope
			});

			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(authCode);
			vi.mocked(mockPkceVerifier.verify).mockReturnValue(true);
			vi.mocked(mockJwtService.generateAccessToken).mockReturnValue('jwt-access-token');

			// Execute
			const result = await useCase.execute(validRequest);

			// Verify
			expect(result).toEqual({
				access_token: 'jwt-access-token',
				token_type: 'Bearer',
				expires_in: 900
			});
			expect(result).not.toHaveProperty('scope');
		});

		it('should throw InvalidGrantError when authorization code not found', async () => {
			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(null);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(InvalidGrantError);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow('Authorization code not found');
		});

		it('should throw InvalidGrantError when authorization code is already used', async () => {
			const clientId = ClientIdVO.create('test-client-id');
			const codeChallenge = CodeChallengeVO.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
			const authCode = AuthCodeEntity.create({
				code: 'test-auth-code',
				clientId,
				userId: 'test-user',
				redirectUri: 'https://example.com/callback',
				codeChallenge,
				expirationMinutes: 5
			});

			// Mark as used
			authCode.markAsUsed();

			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(authCode);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(InvalidGrantError);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow('Authorization code already used');

			expect(mockLogger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Attempt to reuse authorization code'),
				{ code: 'test-auth-code' }
			);
		});

		it('should throw InvalidGrantError when authorization code is expired', async () => {
			const clientId = ClientIdVO.create('test-client-id');
			const codeChallenge = CodeChallengeVO.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
			const authCode = AuthCodeEntity.create({
				code: 'test-auth-code',
				clientId,
				userId: 'test-user',
				redirectUri: 'https://example.com/callback',
				codeChallenge,
				expirationMinutes: -1 // Expired
			});

			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(authCode);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(InvalidGrantError);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow('Authorization code expired');

			expect(mockLogger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Authorization code expired'),
				{ code: 'test-auth-code' }
			);
		});

		it('should throw InvalidGrantError for invalid client_id', async () => {
			const invalidRequest = {
				...validRequest,
				client_id: 'a' // Too short
			};

			await expect(useCase.execute(invalidRequest))
				.rejects
				.toThrow(InvalidGrantError);
		});

		it('should throw InvalidGrantError for invalid code_verifier', async () => {
			const invalidRequest = {
				...validRequest,
				code_verifier: 'short' // Too short
			};

			await expect(useCase.execute(invalidRequest))
				.rejects
				.toThrow(InvalidGrantError);
		});

		it('should throw InvalidGrantError when client ID mismatch', async () => {
			const clientId = ClientIdVO.create('different-client-id');
			const codeChallenge = CodeChallengeVO.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
			const authCode = AuthCodeEntity.create({
				code: 'test-auth-code',
				clientId,
				userId: 'test-user',
				redirectUri: 'https://example.com/callback',
				codeChallenge,
				expirationMinutes: 5
			});

			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(authCode);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(InvalidGrantError);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow('Client ID mismatch');
		});

		it('should throw InvalidGrantError when redirect URI mismatch', async () => {
			const clientId = ClientIdVO.create('test-client-id');
			const codeChallenge = CodeChallengeVO.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
			const authCode = AuthCodeEntity.create({
				code: 'test-auth-code',
				clientId,
				userId: 'test-user',
				redirectUri: 'https://different.com/callback',
				codeChallenge,
				expirationMinutes: 5
			});

			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(authCode);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(InvalidGrantError);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow('Redirect URI mismatch');
		});

		it('should throw InvalidGrantError when PKCE verification fails', async () => {
			const clientId = ClientIdVO.create('test-client-id');
			const codeChallenge = CodeChallengeVO.create('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM', 'S256');
			const authCode = AuthCodeEntity.create({
				code: 'test-auth-code',
				clientId,
				userId: 'test-user',
				redirectUri: 'https://example.com/callback',
				codeChallenge,
				expirationMinutes: 5
			});

			vi.mocked(mockCodeRepository.findByCode).mockResolvedValue(authCode);
			vi.mocked(mockPkceVerifier.verify).mockReturnValue(false);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(InvalidGrantError);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow('Invalid code_verifier');

			expect(mockLogger.warn).toHaveBeenCalledWith(
				expect.stringContaining('Invalid PKCE code_verifier'),
				{ client_id: 'test-client-id' }
			);
		});

		it('should log unexpected errors', async () => {
			const error = new Error('Database error');
			vi.mocked(mockCodeRepository.findByCode).mockRejectedValue(error);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(error);

			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.stringContaining('Unexpected error exchanging code for token'),
				{
					error: 'Database error',
					client_id: 'test-client-id'
				}
			);
		});
	});
});
