import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';

export class UploadExcelQuizParams {
  constructor(
    public bankId: string,
    public file: Buffer,
    public fileName: string,
    public fileHash?: string,
  ) {}
}

export class UploadExcelQuizUsecase implements Usecase<{ message: string; totalQuestionsImported: number }, UploadExcelQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: UploadExcelQuizParams): Promise<Either<Failure, { message: string; totalQuestionsImported: number }>> {
    return this.repository.uploadExcel(params.bankId, params.file, params.fileName, params.fileHash);
  }
}
