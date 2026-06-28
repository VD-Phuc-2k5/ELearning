import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRoadmapProgressRepository,
  USER_ROADMAP_PROGRESS_REPOSITORY,
} from '../../domain/repositories/user-roadmap-progress.repository.interface';
import {
  IRoadmapItemRepository,
  ROADMAP_ITEM_REPOSITORY,
} from '../../domain/repositories/roadmap-item.repository.interface';
import { UserRoadmapProgressDomain } from '../../domain/entities/user-roadmap-progress.domain';

@Injectable()
export class EnrollRoadmapUseCase {
  constructor(
    @Inject(USER_ROADMAP_PROGRESS_REPOSITORY)
    private readonly progressRepo: IUserRoadmapProgressRepository,
    @Inject(ROADMAP_ITEM_REPOSITORY)
    private readonly itemRepo: IRoadmapItemRepository,
  ) {}

  async execute(
    roadmapId: string,
    userId: string,
  ): Promise<UserRoadmapProgressDomain> {
    const existing = await this.progressRepo.findByUserAndRoadmap(
      userId,
      roadmapId,
    );
    if (existing) return existing;

    const totalBanks = await this.itemRepo.countItems(roadmapId);
    return this.progressRepo.upsert({
      userId,
      roadmapId,
      totalBanks,
      completedBanks: 0,
      progressPercent: 0,
      status: 'in_progress',
      startedAt: new Date(),
    });
  }
}
