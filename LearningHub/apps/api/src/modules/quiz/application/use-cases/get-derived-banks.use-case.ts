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
    if (!bank || bank.statusId !== 'approved') return { data: [] };
    if (!bank.fileHash) return { data: [] };

    const original = await this.questionBankRepository.findOriginalByHash(
      bank.fileHash,
    );
    if (!original || original.uploaderId !== requesterId) return { data: [] };

    const derived = await this.questionBankRepository.findDerivedBanks(
      bank.fileHash,
      requesterId,
    );
    return { data: derived };
  }
}
