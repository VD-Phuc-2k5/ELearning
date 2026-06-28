import { Inject, Injectable } from '@nestjs/common';
import {
  IRoadmapRepository,
  ROADMAP_REPOSITORY,
  GetRoadmapListInput,
  RoadmapListPage,
} from '../../domain/repositories/roadmap.repository.interface';

export interface RoadmapListResult extends RoadmapListPage {
  page: number;
  limit: number;
}

@Injectable()
export class GetRoadmapListUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  async execute(
    input: GetRoadmapListInput & { page?: number; limit?: number },
  ): Promise<RoadmapListResult> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const { data, total } = await this.roadmapRepo.findAll({
      ...input,
      page,
      limit,
    });
    return { data, total, page, limit };
  }
}
