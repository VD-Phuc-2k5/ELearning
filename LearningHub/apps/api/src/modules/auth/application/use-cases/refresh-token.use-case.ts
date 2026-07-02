import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IRefreshTokenRepository } from '../../domain/repositories/i-refresh-token.repository';
import { IHashService } from '../interfaces/i-hash.service';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { ITokenService } from '../interfaces/i-token.service';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

export type RefreshTokenParams = RefreshTokenDto;

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase
  implements Usecase<RefreshTokenResult, RefreshTokenParams>
{
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
  ) {}

  async execute(
    params: RefreshTokenParams,
  ): Promise<Either<Failure, RefreshTokenResult>> {
    const tokenHash = this.hashService.hash(params.token);
    const refreshToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (
      !refreshToken ||
      refreshToken.revokedAt !== null ||
      refreshToken.expiresAt < new Date()
    ) {
      return left(AuthFailures.invalidRefreshToken());
    }
    await this.refreshTokenRepository.revoke(refreshToken);
    const user = await this.userRepository.findById(refreshToken.userId);
    if (!user) {
      return left(AuthFailures.userNotFound());
    }
    const newAccessToken = this.tokenService.generateAccessToken(user);
    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newRefreshTokenHash = this.hashService.hash(newRefreshToken);
    const newRefreshTokenEntity = new RefreshToken(
      crypto.randomUUID(),
      newRefreshTokenHash,
      user.id,
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      null,
    );
    await this.refreshTokenRepository.save(newRefreshTokenEntity);
    return right({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }
}
