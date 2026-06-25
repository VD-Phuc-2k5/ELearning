import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import { QuestionBankDomain } from '../../domain/entities/question-bank.domain';

@Injectable()
export class GetQuestionBankDetailUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
  ) {}

  async execute(id: string): Promise<QuestionBankDomain> {
    const bank = await this.questionBankRepository.findById(id);
    if (!bank) {
      throw new NotFoundException(`Không tìm thấy ngân hàng câu hỏi với ID: ${id}`);
    }
    return bank;
  }
}
