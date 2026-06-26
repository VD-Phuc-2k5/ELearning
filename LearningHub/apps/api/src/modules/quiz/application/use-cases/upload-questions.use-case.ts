import { Inject, Injectable } from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
  CreateQuestionInput,
} from '../../domain/repositories/question.repository.interface';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import {
  IUploadRepository,
  UPLOAD_REPOSITORY,
} from '../../domain/repositories/upload.repository.interface';

type UploadQuestionsResult = { message: string };

@Injectable()
export class UploadQuestionsUseCase {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(UPLOAD_REPOSITORY)
    private readonly uploadRepository: IUploadRepository,
  ) {}

  async execute(
    bankId: string,
    questions: Omit<CreateQuestionInput, 'questionBankId'>[],
    uploadedBy: string,
  ) {
    await this.questionRepository.createMany(
      questions.map((q) => ({ ...q, questionBankId: bankId })),
    );
    const all = await this.questionRepository.findByBankId(bankId, false);
    await this.questionBankRepository.updateTotalQuestions(bankId, all.length);
    await this.uploadRepository.create({
      questionBankId: bankId,
      uploadedBy,
      fileName: null,
      totalQuestionsImported: questions.length,
    });
    const result: UploadQuestionsResult = {
      message: `Đã thêm ${questions.length} câu hỏi thành công.`,
    };
    return result;
  }
}
