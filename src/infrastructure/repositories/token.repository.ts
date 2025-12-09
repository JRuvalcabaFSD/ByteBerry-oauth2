/* eslint-disable @typescript-eslint/no-unused-vars */
import { TokenEntity } from '@domain';
import { ILogger, ITokenRepository } from '@interfaces';

//TODO documentar
export class TokenRepository implements ITokenRepository {
	constructor(private readonly logger: ILogger) {}

	public async saveToken(token: TokenEntity): Promise<void> {
		const { issuedAt, scope, ...rest } = token;
		this.logger.info('JWT token issued', { ...rest });
	}
	public async findByTokenId(tokenId: string): Promise<TokenEntity | null> {
		return null;
	}
	public async isBlacklisted(tokenId: string): Promise<boolean> {
		return false;
	}
	public async blacklistToken(tokenId: string): Promise<void> {
		this.logger.info('JWT token blacklisted', { tokenId });
	}
}
