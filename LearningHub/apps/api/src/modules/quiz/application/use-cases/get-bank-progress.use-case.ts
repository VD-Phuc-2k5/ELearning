import { Inject, Injectable } from '@nestjs/common';
import {
  IUserBankProgressRepository,
  USER_BANK_PROGRESS_REPOSITORY,
} from '../../domain/repositories/user-bank-progress.repository.interface';

@Injectable()
export class GetBankProgressUseCase {
  constructor(
    @Inject(USER_BANK_PROGRESS_REPOSITORY)
    private readonly repo: IUserBankProgressRepository,
  ) {}

  execute(bankId: string, userId: string) {
    return this.repo.findByUserAndBank(userId, bankId);
  }
}
