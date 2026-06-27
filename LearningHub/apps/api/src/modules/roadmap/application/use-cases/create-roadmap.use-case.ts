import { Inject, Injectable } from '@nestjs/common';
import {
  IRoadmapRepository,
  ROADMAP_REPOSITORY,
} from '../../domain/repositories/roadmap.repository.interface';
import { RoadmapDomain } from '../../domain/entities/roadmap.domain';

export interface CreateRoadmapParams {
  title: string;
  description?: string;
}

@Injectable()
export class CreateRoadmapUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
  ) {}

  execute(dto: CreateRoadmapParams, userId: string): Promise<RoadmapDomain> {
    return this.roadmapRepo.create({
      title: dto.title,
      description: dto.description,
      creatorId: userId,
    });
  }
}
