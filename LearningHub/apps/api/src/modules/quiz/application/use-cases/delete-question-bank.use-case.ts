import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';

@Injectable()
export class DeleteQuestionBankUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    const bank = await this.questionBankRepository.findById(id);
    if (!bank) {
      throw new NotFoundException(`Không tìm thấy ngân hàng câu hỏi với ID: ${id}`);
    }

    await this.questionBankRepository.delete(id);
    return { message: 'Đã xóa ngân hàng câu hỏi thành công.' };
  }
}
