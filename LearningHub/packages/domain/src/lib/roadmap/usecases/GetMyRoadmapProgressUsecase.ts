import { Either, Failure, NoParams, Usecase } from '@learning-hub/core';
import { IRoadmapRepository } from '../repositories/IRoadmapRepository';
import { UserRoadmapProgress } from '../entities/UserRoadmapProgress';

export class GetMyRoadmapProgressUsecase
  implements Usecase<UserRoadmapProgress[], NoParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(_params: NoParams): Promise<Either<Failure, UserRoadmapProgress[]>> {
    return this.repository.getMyRoadmapProgress();
  }
}
