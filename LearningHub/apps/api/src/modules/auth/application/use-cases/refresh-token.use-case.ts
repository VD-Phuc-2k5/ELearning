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

// ponytail: two tabs/requests racing on the same refresh token both read it
// before either rotation lands, so the loser sees a just-revoked token.
// Grace window treats that as a race, not a replay, and mints it a token of
// its own. Ceiling: a stolen token is reusable for up to this long after
// rotation — raise the ceiling (reuse-chain detection) if that risk matters.
const REFRESH_GRACE_WINDOW_MS = 10_000;

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
    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      return left(AuthFailures.invalidRefreshToken());
    }
    const alreadyRevoked = refreshToken.revokedAt !== null;
    const withinGraceWindow =
      alreadyRevoked &&
      Date.now() - refreshToken.revokedAt!.getTime() < REFRESH_GRACE_WINDOW_MS;
    if (alreadyRevoked && !withinGraceWindow) {
      return left(AuthFailures.invalidRefreshToken());
    }
    if (!alreadyRevoked) {
      await this.refreshTokenRepository.revoke(refreshToken);
    }
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
