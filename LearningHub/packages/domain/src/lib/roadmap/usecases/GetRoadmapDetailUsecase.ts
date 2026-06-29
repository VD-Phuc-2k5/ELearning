import { Either, Failure, Usecase } from '@learning-hub/core';
import { IRoadmapRepository } from '../repositories/IRoadmapRepository';
import { RoadmapDetail } from '../entities/RoadmapDetail';

export class GetRoadmapDetailParams {
  constructor(public id: string) {}
}

export class GetRoadmapDetailUsecase
  implements Usecase<RoadmapDetail, GetRoadmapDetailParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(
    params: GetRoadmapDetailParams,
  ): Promise<Either<Failure, RoadmapDetail>> {
    return this.repository.getRoadmapDetail(params.id);
  }
}
