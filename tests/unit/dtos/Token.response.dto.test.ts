import { TokenResponseDTO } from '@application';

describe('TokenResponseDTO', () => {
	const validData = {
		accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
		expiresIn: 3600,
		scope: 'read write',
	};

	it('should create DTO with valid data', () => {
		const dto = new TokenResponseDTO(validData);

		expect(dto).toBeDefined();
	});

	it('should convert to JSON with snake_case fields', () => {
		const dto = new TokenResponseDTO(validData);
		const json = dto.toJson();

		expect(json).toEqual({
			access_token: validData.accessToken,
			token_type: 'Bearer',
			expires_in: validData.expiresIn,
			scope: validData.scope,
		});
	});

	it('should always use Bearer token type', () => {
		const dto = new TokenResponseDTO(validData);
		const json = dto.toJson();

		expect(json.token_type).toBe('Bearer');
	});

	it('should preserve all token data', () => {
		const customData = {
			accessToken: 'custom-token-xyz',
			expiresIn: 7200,
			scope: 'admin:read admin:write',
		};

		const dto = new TokenResponseDTO(customData);
		const json = dto.toJson();

		expect(json.access_token).toBe('custom-token-xyz');
		expect(json.expires_in).toBe(7200);
		expect(json.scope).toBe('admin:read admin:write');
	});
});
