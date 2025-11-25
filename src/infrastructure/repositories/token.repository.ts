/* eslint-disable @typescript-eslint/no-unused-vars */
import { TokenEntity } from '@/domain';
import { ILogger, ITokenRepository } from '@/interfaces';
import { handledPrismaError } from '@/shared';
// import { PrismaClient } from 'generated/prisma/client';

//TODO documentar
export class TokenRepository implements ITokenRepository {
  constructor(
    // private readonly client: PrismaClient,
    private readonly logger: ILogger
  ) {}

  public async saveToken(token: TokenEntity): Promise<void> {
    const { issuedAt, scope, ...rest } = token;
    try {
      this.logger.info('JWT token issued', { ...rest });
    } catch (error) {
      throw handledPrismaError(error);
    }
  }
  public async findByTokenId(_tokenId: string): Promise<TokenEntity | null> {
    try {
      return null;
    } catch (error) {
      throw handledPrismaError(error);
    }
  }
  public async isBlacklisted(_tokenId: string): Promise<boolean> {
    try {
      return false;
    } catch (error) {
      throw handledPrismaError(error);
    }
  }
  public async blacklistToken(tokenId: string): Promise<void> {
    try {
      // For F2: Simple logging, no actual blacklist
      this.logger.info('JWT token blacklisted', { tokenId });
    } catch (error) {
      throw handledPrismaError(error);
    }
  }
}
