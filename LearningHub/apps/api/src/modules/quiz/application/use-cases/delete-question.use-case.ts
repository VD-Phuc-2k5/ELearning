import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';

@Injectable()
export class DeleteQuestionUseCase {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    const question = await this.questionRepository.findById(id);
    if (!question) {
      throw new NotFoundException(`Không tìm thấy câu hỏi với ID: ${id}`);
    }

    const bankId = question.questionBankId;

    await this.questionRepository.delete(id);

    // Cập nhật lại tổng số câu hỏi trong ngân hàng
    const remainingQuestions = await this.questionRepository.findByBankId(bankId, false);
    await this.questionBankRepository.updateTotalQuestions(bankId, remainingQuestions.length);

    return { message: 'Đã xóa câu hỏi thành công.' };
  }
}
