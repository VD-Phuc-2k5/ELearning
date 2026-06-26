import { Inject, Injectable } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';

type DerivedBankInfo = {
  id: string;
  title: string;
  createdAt: Date;
  uploaderUsername: string;
};
type DerivedBanksResult = { data: DerivedBankInfo[] };

@Injectable()
export class GetDerivedBanksUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
  ) {}

  async execute(id: string, requesterId: string): Promise<DerivedBanksResult> {
    const bank = await this.questionBankRepository.findById(id);
    if (!bank || bank.uploaderId !== requesterId) return { data: [] };
    if (!bank.fileHash) return { data: [] };
    const derived = await this.questionBankRepository.findDerivedBanks(
      bank.fileHash,
      bank.uploaderId,
    );
    // ponytail: first uploader = original owner; copies have newer createdAt
    const bankCreatedAt = new Date(bank.createdAt);
    const isOriginal = derived.every(
      (d) => new Date(d.createdAt) > bankCreatedAt,
    );
    return isOriginal ? { data: derived } : { data: [] };
  }
}
