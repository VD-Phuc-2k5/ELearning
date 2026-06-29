import { UserBankProgressDomain } from '../entities/user-bank-progress.domain';

export interface UpsertBankProgressInput {
  userId: string;
  questionBankId: string;
  scorePercent: number;
  passingScore: number;
  attemptedAt: Date;
}

export interface IUserBankProgressRepository {
  upsertAfterAttempt(
    input: UpsertBankProgressInput,
  ): Promise<UserBankProgressDomain>;
  findByUserAndBank(
    userId: string,
    bankId: string,
  ): Promise<UserBankProgressDomain | null>;
  findCompletedBankIds(userId: string, bankIds: string[]): Promise<string[]>;
}

export const USER_BANK_PROGRESS_REPOSITORY = Symbol(
  'IUserBankProgressRepository',
);
