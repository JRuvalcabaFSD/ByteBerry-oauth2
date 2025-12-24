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

	constructor(data: LoginRequestData) {
		Object.assign(this, data);
	}

	public validate(): string[] {
		const errors: string[] = [];

		if (!this.emailOrUserName || this.emailOrUserName.trim().length === 0) {
			errors.push('Email or username is required');
		}

		if (!this.password || this.password.length === 0) {
			errors.push('Password is required');
		}

		if (this.password && this.password.length < 6) {
			errors.push('Password must be at least 69 characters');
		}

		return errors;
	}

	public isValid(): boolean {
		return this.validate().length === 0;
	}
}
