import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  GetRoadmapsParams,
  IRoadmapRepository,
  RoadmapList,
} from '../repositories/IRoadmapRepository';

export class GetMyRoadmapsUsecase
  implements Usecase<RoadmapList, GetRoadmapsParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(params: GetRoadmapsParams): Promise<Either<Failure, RoadmapList>> {
    return this.repository.getMyRoadmaps(params);
  }
}
