import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  IRoadmapRepository,
  UpdateRoadmapParams,
} from '../repositories/IRoadmapRepository';
import { Roadmap } from '../entities/Roadmap';

export class UpdateRoadmapUsecaseParams {
  constructor(
    public id: string,
    public data: UpdateRoadmapParams,
  ) {}
}

export class UpdateRoadmapUsecase
  implements Usecase<Roadmap, UpdateRoadmapUsecaseParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(
    params: UpdateRoadmapUsecaseParams,
  ): Promise<Either<Failure, Roadmap>> {
    return this.repository.updateRoadmap(params.id, params.data);
  }
}
