import { Either, Failure, Usecase } from '@learning-hub/core';
import { IRoadmapRepository } from '../repositories/IRoadmapRepository';

export class DeleteRoadmapParams {
  constructor(public id: string) {}
}

export class DeleteRoadmapUsecase
  implements Usecase<void, DeleteRoadmapParams>
{
  constructor(private repository: IRoadmapRepository) {}
  execute(params: DeleteRoadmapParams): Promise<Either<Failure, void>> {
    return this.repository.deleteRoadmap(params.id);
  }
}
