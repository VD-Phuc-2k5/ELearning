import { Either, Failure, Usecase } from '@learning-hub/core';
import { IQuizRepository } from '../repositories/IQuizRepository';

export class DeleteTagQuizParams {
  constructor(public id: number) {}
}

export class DeleteTagQuizUsecase
  implements Usecase<void, DeleteTagQuizParams>
{
  constructor(private repository: IQuizRepository) {}
  execute(params: DeleteTagQuizParams): Promise<Either<Failure, void>> {
    return this.repository.deleteTag(params.id);
  }
}
