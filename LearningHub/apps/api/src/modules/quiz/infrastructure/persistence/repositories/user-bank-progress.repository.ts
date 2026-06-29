import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserBankProgressEntity } from '../entities/user-bank-progress.entity';
import {
  IUserBankProgressRepository,
  UpsertBankProgressInput,
} from '../../../domain/repositories/user-bank-progress.repository.interface';
import { UserBankProgressDomain } from '../../../domain/entities/user-bank-progress.domain';

@Injectable()
export class UserBankProgressRepository implements IUserBankProgressRepository {
  constructor(
    @InjectRepository(UserBankProgressEntity)
    private readonly repo: Repository<UserBankProgressEntity>,
  ) {}

  private toDomain(e: UserBankProgressEntity): UserBankProgressDomain {
    return {
      id: e.id,
      userId: e.userId,
      questionBankId: e.questionBankId,
      attemptCount: e.attemptCount,
      bestScore: e.bestScore !== null ? Number(e.bestScore) : null,
      latestScore: e.latestScore !== null ? Number(e.latestScore) : null,
      isCompleted: e.isCompleted,
      completedAt: e.completedAt,
      firstAttemptAt: e.firstAttemptAt,
      lastAccessedAt: e.lastAccessedAt,
    };
  }

  async upsertAfterAttempt(
    input: UpsertBankProgressInput,
  ): Promise<UserBankProgressDomain> {
    const { userId, questionBankId, scorePercent, passingScore, attemptedAt } =
      input;
    let row = await this.repo.findOne({ where: { userId, questionBankId } });
    if (!row) {
      row = this.repo.create({
        userId,
        questionBankId,
        attemptCount: 0,
        isCompleted: false,
        firstAttemptAt: attemptedAt,
      });
    }
    row.attemptCount += 1;
    row.latestScore = scorePercent;
    if (row.bestScore === null || scorePercent > Number(row.bestScore))
      row.bestScore = scorePercent;
    if (!row.isCompleted && scorePercent >= passingScore) {
      row.isCompleted = true;
      row.completedAt = attemptedAt;
    }
    row.lastAccessedAt = attemptedAt;
    return this.toDomain(await this.repo.save(row));
  }

  async findByUserAndBank(
    userId: string,
    bankId: string,
  ): Promise<UserBankProgressDomain | null> {
    const e = await this.repo.findOne({
      where: { userId, questionBankId: bankId },
    });
    return e ? this.toDomain(e) : null;
  }

  async findCompletedBankIds(
    userId: string,
    bankIds: string[],
  ): Promise<string[]> {
    if (!bankIds.length) return [];
    const rows = await this.repo.find({
      where: { userId, questionBankId: In(bankIds), isCompleted: true },
      select: { questionBankId: true },
    });
    return rows.map((r) => r.questionBankId);
  }
}
