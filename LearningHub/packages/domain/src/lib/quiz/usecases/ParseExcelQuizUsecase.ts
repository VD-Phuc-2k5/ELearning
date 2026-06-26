import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';

export class ParseExcelQuizParams {
  constructor(
    public bankId: string,
    public file: Buffer,
    public fileName: string,
  ) {}
}

export class ParseExcelQuizUsecase implements Usecase<{ questions: unknown[] }, ParseExcelQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: ParseExcelQuizParams): Promise<Either<Failure, { questions: unknown[] }>> {
    return this.repository.parseExcel(params.bankId, params.file, params.fileName);
  }
}
