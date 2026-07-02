import { PasswordResetToken } from '../entities/password-reset-token.entity';

export interface IPasswordResetTokenRepository {
  findByTokenHash(hash: string): Promise<PasswordResetToken | null>;
  save(token: PasswordResetToken): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
