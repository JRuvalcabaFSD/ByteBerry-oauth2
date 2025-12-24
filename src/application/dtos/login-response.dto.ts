import { SessionEntity, UserEntity } from '@domain';

interface User {
	id: string;
	email: string;
	username: string | null;
	fullName: string | null;
	roles: string[];
}

interface LoginResponseData {
	sessionId: string;
	user: User;
	expiresAt: Date;
	message: string;
}

//TODO documentar
export class LoginResponseDTO {
	public readonly sessionId!: string;
	public readonly user!: User;
	public readonly expiresAt!: Date;
	public readonly message!: string;

	constructor(data: LoginResponseData) {
		Object.assign(this, { ...data, message: data.message ?? 'Login successful' });
	}

	static fromEntities(user: UserEntity, session: SessionEntity): LoginResponseDTO {
		return new LoginResponseDTO({
			sessionId: session.id,
			user: user.toPublic(),
			expiresAt: session.expiresAt,
			message: 'Login successful',
		});
	}

	public toJson(): { user: User; expiresAt: string; message: string } {
		return {
			user: this.user,
			expiresAt: this.expiresAt.toISOString(),
			message: this.message,
		};
	}
}
