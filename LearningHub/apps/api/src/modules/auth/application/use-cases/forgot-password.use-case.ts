import { Inject, Injectable, Logger } from '@nestjs/common';
import { Either, Failure, Usecase, right } from '@learning-hub/core';
import { IUserRepository } from '../../domain/repositories/i-user.repository';
import { IPasswordResetTokenRepository } from '../../domain/repositories/i-password-reset-token.repository';
import { IEmailService } from '../interfaces/i-email.service';
import { IHashService } from '../interfaces/i-hash.service';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class ForgotPasswordUseCase implements Usecase<void, { email: string }> {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordResetTokenRepository')
    private readonly passwordResetTokenRepository: IPasswordResetTokenRepository,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(params: { email: string }): Promise<Either<Failure, void>> {
    const user = await this.userRepository.findByEmail(params.email);
    if (!user) {
      this.logger.warn(
        `Forgot password request for non-existent email: ${params.email}`,
      );
      // Security best practice: do not reveal that user doesn't exist
      return right(undefined);
    }

    // 1. Delete existing tokens for this user
    await this.passwordResetTokenRepository.deleteByUserId(user.id);

    // 2. Generate secure token
    const rawToken = crypto.randomUUID();
    const tokenHash = this.hashService.hash(rawToken);

    // 3. Save to database with 10-minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resetToken = new PasswordResetToken(
      crypto.randomUUID(),
      tokenHash,
      user.id,
      expiresAt,
      null,
      new Date(),
    );

    await this.passwordResetTokenRepository.save(resetToken);

    // 4. Send email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3002';
    const resetLink = `${frontendUrl}/auth/reset-password?token=${rawToken}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    return right(undefined);
  }
}
