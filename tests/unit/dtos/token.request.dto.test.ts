import { TokenRequestDTO } from '@application';
import { InvalidOAuthRequestError } from '@shared';

describe('TokenRequestDTO', () => {
	const validBody = {
		grant_type: 'authorization_code',
		code: 'test-auth-code-12345',
		redirect_uri: 'https://example.com/callback',
		client_id: 'test-client-id',
		code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
	};

	it('should create DTO from valid body', () => {
		const dto = TokenRequestDTO.fromBody(validBody);

		expect(dto.grantType).toBe(validBody.grant_type);
		expect(dto.code).toBe(validBody.code);
		expect(dto.redirectUri).toBe(validBody.redirect_uri);
		expect(dto.clientId).toBe(validBody.client_id);
		expect(dto.codeVerifier).toBe(validBody.code_verifier);
	});

	it('should throw error when required parameters are missing', () => {
		expect(() => TokenRequestDTO.fromBody({})).toThrow(InvalidOAuthRequestError);
		expect(() => TokenRequestDTO.fromBody({ client_id: 'test' })).toThrow(InvalidOAuthRequestError);
	});

	it('should throw error for invalid grant_type', () => {
		const invalidBody = { ...validBody, grant_type: 'invalid_grant' };

		expect(() => TokenRequestDTO.fromBody(invalidBody)).toThrow(InvalidOAuthRequestError);
	});

	it('should throw error for invalid redirect_uri', () => {
		const invalidBody = { ...validBody, redirect_uri: 'not-a-valid-url' };

		expect(() => TokenRequestDTO.fromBody(invalidBody)).toThrow(InvalidOAuthRequestError);
	});

	it('should throw error when code_verifier is missing', () => {
		const invalidBody = { ...validBody, code_verifier: '' };
		delete (invalidBody as any).code_verifier;

		expect(() => TokenRequestDTO.fromBody(invalidBody)).toThrow(InvalidOAuthRequestError);
	});
});
