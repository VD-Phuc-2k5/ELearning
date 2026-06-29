import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRoadmapProgressRepository,
  USER_ROADMAP_PROGRESS_REPOSITORY,
} from '../../domain/repositories/user-roadmap-progress.repository.interface';
import {
  IRoadmapItemRepository,
  ROADMAP_ITEM_REPOSITORY,
} from '../../domain/repositories/roadmap-item.repository.interface';
import {
  IUserBankProgressRepository,
  USER_BANK_PROGRESS_REPOSITORY,
} from '../../../quiz/domain/repositories/user-bank-progress.repository.interface';
import { UserRoadmapProgressDomain } from '../../domain/entities/user-roadmap-progress.domain';
import { RoadmapProgressStatus } from '../../domain/entities/user-roadmap-progress.domain';

@Injectable()
export class EnrollRoadmapUseCase {
  constructor(
    @Inject(USER_ROADMAP_PROGRESS_REPOSITORY)
    private readonly progressRepo: IUserRoadmapProgressRepository,
    @Inject(ROADMAP_ITEM_REPOSITORY)
    private readonly itemRepo: IRoadmapItemRepository,
    @Inject(USER_BANK_PROGRESS_REPOSITORY)
    private readonly bankProgressRepo: IUserBankProgressRepository,
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

    const items = await this.itemRepo.findByRoadmapId(roadmapId);
    const totalBanks = items.length;
    const bankIds = items.map((i) => i.questionBankId);
    const completedBanks =
      totalBanks > 0
        ? (await this.bankProgressRepo.findCompletedBankIds(userId, bankIds))
            .length
        : 0;
    const progressPercent =
      totalBanks > 0 ? Math.round((completedBanks / totalBanks) * 100) : 0;
    const status: RoadmapProgressStatus =
      completedBanks >= totalBanks && totalBanks > 0
        ? 'completed'
        : 'in_progress';

    return this.progressRepo.upsert({
      userId,
      roadmapId,
      totalBanks,
      completedBanks,
      progressPercent,
      status,
      startedAt: new Date(),
    });
  }
}
