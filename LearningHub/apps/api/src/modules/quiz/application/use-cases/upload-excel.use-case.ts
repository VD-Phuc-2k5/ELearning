import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IExcelParserService,
  EXCEL_PARSER_SERVICE,
} from '../interfaces/i-excel-parser.service';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from '../../domain/repositories/question.repository.interface';
import {
  IQuestionBankRepository,
  QUESTION_BANK_REPOSITORY,
} from '../../domain/repositories/question-bank.repository.interface';
import {
  IUploadRepository,
  UPLOAD_REPOSITORY,
} from '../../domain/repositories/upload.repository.interface';

type UploadExcelResult = { message: string; totalQuestionsImported: number };

@Injectable()
export class UploadExcelUseCase {
  constructor(
    @Inject(EXCEL_PARSER_SERVICE)
    private readonly excelParserService: IExcelParserService,
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(QUESTION_BANK_REPOSITORY)
    private readonly questionBankRepository: IQuestionBankRepository,
    @Inject(UPLOAD_REPOSITORY)
    private readonly uploadRepository: IUploadRepository,
  ) {}

  async execute(
    bankId: string,
    fileBuffer: Buffer,
    fileName: string,
    uploaderId: string,
    fileHash?: string,
  ): Promise<UploadExcelResult> {
    const bank = await this.questionBankRepository.findById(bankId);
    if (!bank) {
      throw new NotFoundException(
        `Không tìm thấy ngân hàng câu hỏi với ID: ${bankId}`,
      );
    }

    if (fileHash) {
      await this.questionBankRepository.update(bankId, { fileHash });
    }

    const parsedQuestions = await this.excelParserService.parse(fileBuffer);

    const createInputs = parsedQuestions.map((q) => ({
      questionBankId: bankId,
      content: q.content,
      explanation: q.explanation,
      answerOptions: q.answerOptions,
      correctOptionLabels: q.correctOptionLabels,
    }));

    await this.questionRepository.createMany(createInputs);

    const allQuestions = await this.questionRepository.findByBankId(
      bankId,
      false,
    );
    await this.questionBankRepository.updateTotalQuestions(
      bankId,
      allQuestions.length,
    );

    await this.uploadRepository.create({
      questionBankId: bankId,
      uploadedBy: uploaderId,
      fileName,
      totalQuestionsImported: parsedQuestions.length,
    });

    return {
      message: `Đã thêm ${parsedQuestions.length} câu hỏi thành công từ file Excel.`,
      totalQuestionsImported: parsedQuestions.length,
    };
  }
}
