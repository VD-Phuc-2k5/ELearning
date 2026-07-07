import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { Problem } from '../entities/entities';

export class GetProblemDetailUsecase implements Usecase<Problem, string> {
  constructor(private repository: IProblemRepository) {}
  execute(id: string): Promise<Either<Failure, Problem>> {
    return this.repository.getProblemDetail(id);
  }
}
