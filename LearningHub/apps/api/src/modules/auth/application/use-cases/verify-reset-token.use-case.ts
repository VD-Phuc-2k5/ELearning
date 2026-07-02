import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IPasswordResetTokenRepository } from '../../domain/repositories/i-password-reset-token.repository';
import { IHashService } from '../interfaces/i-hash.service';
import { AuthFailures } from '../../domain/errors/auth.failures';

@Injectable()
export class VerifyResetTokenUseCase
  implements Usecase<void, { token: string }>
{
  constructor(
    @Inject('IPasswordResetTokenRepository')
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(params: { token: string }): Promise<Either<Failure, void>> {
    const tokenHash = this.hashService.hash(params.token);
    const resetToken =
      await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken || resetToken.isUsed()) {
      return left(AuthFailures.invalidOrUsedResetToken());
    }

    if (resetToken.isExpired()) {
      return left(AuthFailures.resetTokenExpired());
    }

    return right(undefined);
  }
}
