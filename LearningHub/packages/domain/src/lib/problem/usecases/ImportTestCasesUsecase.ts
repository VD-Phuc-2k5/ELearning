import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';

export class ImportTestCasesParams {
  constructor(
    public problemId: string,
    public file: Buffer,
    public fileName: string,
  ) {}
}

export class ImportTestCasesUsecase
  implements Usecase<unknown, ImportTestCasesParams>
{
  constructor(private repository: IProblemRepository) {}
  execute(params: ImportTestCasesParams): Promise<Either<Failure, unknown>> {
    return this.repository.importTestCases(
      params.problemId,
      params.file,
      params.fileName,
    );
  }
}
