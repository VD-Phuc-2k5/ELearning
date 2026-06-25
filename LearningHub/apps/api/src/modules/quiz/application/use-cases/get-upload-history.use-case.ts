import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import {
  IUploadRepository,
  UPLOAD_REPOSITORY,
} from '../../domain/repositories/upload.repository.interface';
import { QuestionBankUploadDomain } from '../../domain/entities/question-bank-upload.domain';

@Injectable()
export class GetUploadHistoryUseCase {
  constructor(
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(UPLOAD_REPOSITORY)
    private readonly uploadRepository: IUploadRepository,
  ) {}

  async execute(bankId: string): Promise<QuestionBankUploadDomain[]> {
    const bank = await this.questionBankRepository.findById(bankId);
    if (!bank) {
      throw new NotFoundException(`Không tìm thấy ngân hàng câu hỏi với ID: ${bankId}`);
    }

    return this.uploadRepository.findByBankId(bankId);
  }
}
