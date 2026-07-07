import { Either, Failure, Usecase } from '@learning-hub/core';
import { IProblemRepository } from '../repositories/IProblemRepository';
import { Submission } from '../entities/entities';

export class GetSubmissionStatusUsecase implements Usecase<Submission, string> {
  constructor(private repository: IProblemRepository) {}
  execute(submissionId: string): Promise<Either<Failure, Submission>> {
    return this.repository.getSubmissionStatus(submissionId);
  }
}
