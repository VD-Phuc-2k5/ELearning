import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { ParseExcelResult } from '../entities/entities';

export class ParseExcelQuizParams {
  constructor(
    public bankId: string,
    public file: Buffer,
    public fileName: string,
  ) {}
}

export class ParseExcelQuizUsecase implements Usecase<ParseExcelResult, ParseExcelQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: ParseExcelQuizParams): Promise<Either<Failure, ParseExcelResult>> {
    return this.repository.parseExcel(params.bankId, params.file, params.fileName);
  }
}
