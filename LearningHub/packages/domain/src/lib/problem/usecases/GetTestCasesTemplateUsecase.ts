import { Either, Failure, Usecase, NoParams } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';

export class GetTestCasesTemplateUsecase
  implements Usecase<{ data: string; contentType: string }, NoParams>
{
  constructor(private repository: IProblemRepository) {}
  execute(
    _params: NoParams,
  ): Promise<Either<Failure, { data: string; contentType: string }>> {
    return this.repository.getTestCasesTemplate();
  }
}
