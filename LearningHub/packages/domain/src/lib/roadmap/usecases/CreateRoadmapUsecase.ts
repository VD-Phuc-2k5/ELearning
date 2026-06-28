import { Either, Failure, Usecase } from '@learning-hub/core';
import {
  IRoadmapRepository,
  CreateRoadmapParams,
} from '../repositories/IRoadmapRepository';
import { Roadmap } from '../entities/Roadmap';

export class CreateRoadmapUsecase
  implements Usecase<Roadmap, CreateRoadmapParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(params: CreateRoadmapParams): Promise<Either<Failure, Roadmap>> {
    return this.repository.createRoadmap(params);
  }
}
