import { LoginRequestDTO } from '@application';
import { LoginValidationError } from '@shared';

describe('LoginRequestDTO', () => {
	const validBody = {
		emailOrUserName: 'test@example.com',
		password: 'validPassword123',
		rememberMe: 'true',
		userAgent: 'Mozilla/5.0',
	};

	it('should create DTO from valid body', () => {
		const dto = LoginRequestDTO.fromBody(validBody, '192.168.1.1');

		expect(dto.emailOrUserName).toBe(validBody.emailOrUserName);
		expect(dto.password).toBe(validBody.password);
		expect(dto.rememberMe).toBe(true);
		expect(dto.userAgent).toBe(validBody.userAgent);
		expect(dto.ipAddress).toBe('192.168.1.1');
	});

	it('should throw error when emailOrUserName is missing', () => {
		const invalidBody = { ...validBody, emailOrUserName: '' };

		expect(() => LoginRequestDTO.fromBody(invalidBody)).toThrow(LoginValidationError);
	});

	it('should throw error when password is too short', () => {
		const invalidBody = { ...validBody, password: '12345' };

		expect(() => LoginRequestDTO.fromBody(invalidBody)).toThrow(LoginValidationError);
	});

	it('should throw error when body is empty', () => {
		expect(() => LoginRequestDTO.fromBody({})).toThrow(LoginValidationError);
	});

	it('should handle rememberMe as false when not "true"', () => {
		const bodyWithoutRememberMe = {
			emailOrUserName: 'test@example.com',
			password: 'validPassword123',
		};

		const dto = LoginRequestDTO.fromBody(bodyWithoutRememberMe);

		expect(dto.rememberMe).toBe(false);
	});
});
