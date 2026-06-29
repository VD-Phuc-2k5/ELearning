import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';
import { UploadHistory } from '../entities/entities';

export class GetUploadHistoryQuizParams {
  constructor(public bankId: string) {}
}

export class GetUploadHistoryQuizUsecase implements Usecase<UploadHistory[], GetUploadHistoryQuizParams> {
  constructor(private repository: IQuizRepository) {}
  execute(params: GetUploadHistoryQuizParams): Promise<Either<Failure, UploadHistory[]>> {
    return this.repository.getUploadHistory(params.bankId);
  }
}
