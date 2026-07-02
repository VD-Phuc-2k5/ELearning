import { Inject, Injectable } from '@nestjs/common';
import { Either, Failure, Usecase, left, right } from '@learning-hub/core';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { IPasswordResetTokenRepository } from '../../domain/repositories/i-password-reset-token.repository';
import { IHashService } from '../interfaces/i-hash.service';
import { IPasswordService } from '../interfaces/i-password.service';
import { AuthFailures } from '../../domain/errors/auth.failures';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class ResetPasswordUseCase implements Usecase<void, ResetPasswordDto> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordResetTokenRepository')
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(params: ResetPasswordDto): Promise<Either<Failure, void>> {
    const tokenHash = this.hashService.hash(params.token);
    const resetToken =
      await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken || resetToken.isUsed()) {
      return left(AuthFailures.invalidOrUsedResetToken());
    }

    if (resetToken.isExpired()) {
      return left(AuthFailures.resetTokenExpired());
    }

    // 1. Immediately mark token as used (single-use)
    resetToken.usedAt = new Date();
    await this.passwordResetTokenRepository.save(resetToken);

    // 2. Find user
    const user = await this.userRepository.findById(resetToken.userId);
    if (!user) {
      return left(AuthFailures.userNotFound());
    }

    // 3. Update user password
    const hashedPassword = await this.passwordService.hash(params.newPassword);

    // Construct updated user domain object
    const updatedUser = new User(
      user.id,
      user.email,
      hashedPassword,
      user.username,
      user.avatarUrl,
      user.isActive,
      user.createdAt,
      new Date(),
      user.lockedAt,
    );

    await this.userRepository.update(updatedUser);

    return right(undefined);
  }
}
