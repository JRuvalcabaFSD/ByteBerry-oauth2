import { AuthCodeRequestDTO } from '@application';
import { InvalidOAuthRequestError } from '@shared';

describe('AuthCodeRequestDTO', () => {
	const validQuery = {
		client_id: 'test-client-id-12345',
		redirect_uri: 'https://example.com/callback',
		response_type: 'code',
		code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
		code_challenge_method: 'S256' as const,
		state: 'random-state-value',
		scope: 'read write',
	};

	it('should create DTO from valid query parameters', () => {
		const dto = AuthCodeRequestDTO.fromQuery(validQuery);

		expect(dto.clientId).toBe(validQuery.client_id);
		expect(dto.redirectUri).toBe(validQuery.redirect_uri);
		expect(dto.responseType).toBe(validQuery.response_type);
		expect(dto.codeChallenge).toBe(validQuery.code_challenge);
		expect(dto.codeChallengeMethod).toBe(validQuery.code_challenge_method);
		expect(dto.state).toBe(validQuery.state);
		expect(dto.scope).toBe(validQuery.scope);
	});

	it('should throw error when required parameters are missing', () => {
		expect(() => AuthCodeRequestDTO.fromQuery({})).toThrow(InvalidOAuthRequestError);
		expect(() => AuthCodeRequestDTO.fromQuery({ client_id: '' })).toThrow(InvalidOAuthRequestError);
	});

	it('should throw error for invalid code_challenge', () => {
		const invalidQuery = {
			...validQuery,
			code_challenge: 'short', // Too short
		};

		expect(() => AuthCodeRequestDTO.fromQuery(invalidQuery)).toThrow(InvalidOAuthRequestError);
	});

	it('should throw error for invalid code_challenge_method', () => {
		const invalidQuery = {
			...validQuery,
			code_challenge_method: 'MD5', // Invalid method
		};

		expect(() => AuthCodeRequestDTO.fromQuery(invalidQuery as any)).toThrow(InvalidOAuthRequestError);
	});

	it('should throw error for invalid redirect_uri', () => {
		const invalidQuery = {
			...validQuery,
			redirect_uri: 'not-a-valid-url',
		};

		expect(() => AuthCodeRequestDTO.fromQuery(invalidQuery)).toThrow(InvalidOAuthRequestError);
	});
});
