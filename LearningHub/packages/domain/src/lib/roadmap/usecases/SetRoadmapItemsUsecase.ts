import { Either, Failure, Usecase } from '@learning-hub/core';
import { IRoadmapRepository } from '../repositories/IRoadmapRepository';
import { RoadmapItem } from '../entities/RoadmapItem';

export class SetRoadmapItemsParams {
  constructor(
    public id: string,
    public bankIds: string[],
  ) {}
}

export class SetRoadmapItemsUsecase
  implements Usecase<RoadmapItem[], SetRoadmapItemsParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(
    params: SetRoadmapItemsParams,
  ): Promise<Either<Failure, RoadmapItem[]>> {
    return this.repository.setRoadmapItems(params.id, params.bankIds);
  }
}
