import { Either, Failure, Usecase } from '@learning-hub/core';
import type { AnswerOptionInput } from '../entities/entities';
import { UploadExcelResult } from '../entities/entities';
import { IQuizRepository } from '../repositories/IQuizRepository';

export interface ParsedQuestion {
  content: string;
  explanation?: string;
  answerOptions: AnswerOptionInput[];
  correctOptionLabels: string[];
}

export class UploadExcelQuizParams {
  constructor(
    public bankId: string,
    public file: Buffer,
    public fileName: string,
    public fileHash?: string,
  ) {}
}

export class UploadExcelQuizUsecase
  implements Usecase<UploadExcelResult, UploadExcelQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(
    params: UploadExcelQuizParams,
  ): Promise<Either<Failure, UploadExcelResult>> {
    return this.repository.uploadExcel(
      params.bankId,
      params.file,
      params.fileName,
      params.fileHash,
    );
  }
}
