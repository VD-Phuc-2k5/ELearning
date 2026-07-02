import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';
import { PasswordResetToken } from '../../../domain/entities/password-reset-token.entity';
import { IPasswordResetTokenRepository } from '../../../domain/repositories/i-password-reset-token.repository';

@Injectable()
export class PasswordResetTokenRepository
  implements IPasswordResetTokenRepository
{
  constructor(
    @InjectRepository(PasswordResetTokenEntity)
    private readonly repository: Repository<PasswordResetTokenEntity>,
  ) {}

  async findByTokenHash(hash: string): Promise<PasswordResetToken | null> {
    const entity = await this.repository.findOne({
      where: { tokenHash: hash },
    });
    if (!entity) return null;
    return new PasswordResetToken(
      entity.id,
      entity.tokenHash,
      entity.userId,
      entity.expiresAt,
      entity.usedAt,
      entity.createdAt,
    );
  }

  async save(token: PasswordResetToken): Promise<void> {
    const entity = new PasswordResetTokenEntity();
    entity.id = token.id;
    entity.tokenHash = token.tokenHash;
    entity.userId = token.userId;
    entity.expiresAt = token.expiresAt;
    entity.usedAt = token.usedAt;
    entity.createdAt = token.createdAt;

    await this.repository.save(entity);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}
