import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  IProblemRepository,
  ProblemList,
  GetProblemsParams,
} from '../repositories/IProblemRepository';

export class GetProblemsUsecase
  implements Usecase<ProblemList, GetProblemsParams | undefined>
{
  constructor(private repository: IProblemRepository) {}
  execute(params?: GetProblemsParams): Promise<Either<Failure, ProblemList>> {
    return this.repository.getProblems(params);
  }
}
