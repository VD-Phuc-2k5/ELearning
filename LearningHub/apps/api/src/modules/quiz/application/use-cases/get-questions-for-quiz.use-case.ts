import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';
import { QuestionDomain } from '../../domain/entities/question.domain';

@Injectable()
export class GetQuestionsForQuizUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(bankId: string): Promise<QuestionDomain[]> {
    const bank = await this.questionBankRepository.findById(bankId);
    if (!bank) {
      throw new NotFoundException(`Question bank with id ${bankId} not found`);
    }
    // hideAnswers = true -> trả về câu hỏi KHÔNG có đáp án đúng & giải thích
    return this.questionRepository.findByBankId(bankId, true);
  }
}
