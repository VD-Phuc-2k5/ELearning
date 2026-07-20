import { Inject, Injectable } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import { QuestionBankDomain } from '../../domain/entities/question-bank.domain';

type CheckBankHashResult = { exists: boolean; bank: QuestionBankDomain | null };

@Injectable()
export class CheckBankHashUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
  ) {}

  async execute(
    hash: string,
    _uploaderId: string,
  ): Promise<CheckBankHashResult> {
    const bank = await this.questionBankRepository.findByHash(hash);
    return { exists: !!bank, bank };
  }
}
