import { LoginValidationError } from '@shared';

interface LoginRequestData {
	emailOrUserName: string;
	password: string;
	rememberMe?: boolean;
	userAgent?: string;
	ipAddress?: string;
}

//TODO documentar
export class LoginRequestDTO {
	public readonly emailOrUserName!: string;
	public readonly password!: string;
	public readonly rememberMe?: boolean;
	public readonly userAgent?: string;
	public readonly ipAddress?: string;

	private constructor(data: LoginRequestData) {
		Object.assign(this, data);
	}

	public static toBody(body: Record<string, string>, ip?: string): LoginRequestDTO {
		if (!body || Object.keys(body).length === 0) throw new LoginValidationError('Missing required body');

		const errors: string[] = [];

		if (!body.emailOrUserName || body.emailOrUserName.trim().length === 0) {
			errors.push('Email or username is required (field:emailOrUserName)');
		}

		if (!body.password || body.password.length === 0) {
			errors.push('Password is required');
		}

		if (body.password && body.password.length < 6) {
			errors.push('Password must be at least 6 characters');
		}

		if (errors.length > 0) throw new LoginValidationError('Failed validate data', errors);

		return new LoginRequestDTO({
			emailOrUserName: body.emailOrUserName,
			password: body.password,
			rememberMe: body.rememberMe === 'true',
			userAgent: body.userAgent,
			ipAddress: ip,
		});
	}
}
