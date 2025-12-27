import { AuthCodeResponseDTO } from '@application';

describe('AuthCodeResponseDTO', () => {
	const testCode = 'test-authorization-code-123';
	const testState = 'test-state-xyz';
	const baseRedirectUri = 'https://example.com/callback';

	it('should build redirect URL with code and state', () => {
		const dto = new AuthCodeResponseDTO(testCode, testState);
		const redirectUrl = dto.buildRedirectUrl(baseRedirectUri);

		expect(redirectUrl).toContain('code=test-authorization-code-123');
		expect(redirectUrl).toContain('state=test-state-xyz');
		expect(redirectUrl).toContain(baseRedirectUri);
	});

	it('should build redirect URL without state when not provided', () => {
		const dto = new AuthCodeResponseDTO(testCode);
		const redirectUrl = dto.buildRedirectUrl(baseRedirectUri);

		expect(redirectUrl).toContain('code=test-authorization-code-123');
		expect(redirectUrl).not.toContain('state=');
	});

	it('should convert to JSON with code and state', () => {
		const dto = new AuthCodeResponseDTO(testCode, testState);
		const json = dto.toJSON();

		expect(json).toEqual({
			code: testCode,
			state: testState,
		});
	});

	it('should convert to JSON without state when not provided', () => {
		const dto = new AuthCodeResponseDTO(testCode);
		const json = dto.toJSON();

		expect(json).toEqual({
			code: testCode,
		});
		expect(json).not.toHaveProperty('state');
	});
});
