import { Either, Failure, Usecase } from '@learning-hub/core';
import { IRoadmapRepository } from '../repositories/IRoadmapRepository';
import { UserRoadmapProgress } from '../entities/UserRoadmapProgress';

export class EnrollRoadmapParams {
  constructor(public id: string) {}
}

export class EnrollRoadmapUsecase
  implements Usecase<UserRoadmapProgress, EnrollRoadmapParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(
    params: EnrollRoadmapParams,
  ): Promise<Either<Failure, UserRoadmapProgress>> {
    return this.repository.enrollRoadmap(params.id);
  }
}
