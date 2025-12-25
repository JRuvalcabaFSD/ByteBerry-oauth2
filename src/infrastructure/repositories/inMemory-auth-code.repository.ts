import { AuthCodeEntity } from '@domain';
import { IAuthCodeRepository } from '@interfaces';

export class InMemoryAuthCodeRepository implements IAuthCodeRepository {
	private readonly store = new Map<string, AuthCodeEntity>();

	public async save(code: AuthCodeEntity): Promise<void> {
		// code.markAsUsed();
		this.store.set(code.code, code);
	}
	public async findByCode(code: string): Promise<AuthCodeEntity | null> {
		return this.store.get(code) ?? null;
	}
	public async cleanup(): Promise<void> {
		for (const [code, _authCode] of this.store.entries()) {
			this.store.delete(code);
		}
	}
}
