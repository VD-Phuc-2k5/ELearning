import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  IRoadmapRepository,
  GetRoadmapsParams,
  RoadmapList,
} from '../repositories/IRoadmapRepository';

export class GetRoadmapsUsecase
  implements Usecase<RoadmapList, GetRoadmapsParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(params: GetRoadmapsParams): Promise<Either<Failure, RoadmapList>> {
    return this.repository.getRoadmaps(params);
  }
}
