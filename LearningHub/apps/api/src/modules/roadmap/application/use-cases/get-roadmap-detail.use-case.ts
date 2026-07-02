import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IRoadmapRepository,
  ROADMAP_REPOSITORY,
} from '../../domain/repositories/roadmap.repository.interface';
import {
  IRoadmapItemRepository,
  ROADMAP_ITEM_REPOSITORY,
} from '../../domain/repositories/roadmap-item.repository.interface';
import {
  IUserRoadmapProgressRepository,
  USER_ROADMAP_PROGRESS_REPOSITORY,
} from '../../domain/repositories/user-roadmap-progress.repository.interface';
import {
  IUserBankProgressRepository,
  USER_BANK_PROGRESS_REPOSITORY,
} from '../../../quiz/domain/repositories/user-bank-progress.repository.interface';

@Injectable()
export class GetRoadmapDetailUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
    @Inject(ROADMAP_ITEM_REPOSITORY)
    private readonly itemRepo: IRoadmapItemRepository,
    @Inject(USER_ROADMAP_PROGRESS_REPOSITORY)
    private readonly progressRepo: IUserRoadmapProgressRepository,
    @Inject(USER_BANK_PROGRESS_REPOSITORY)
    private readonly bankProgressRepo: IUserBankProgressRepository,
  ) {}

  async execute(roadmapId: string, userId: string) {
    const roadmap = await this.roadmapRepo.findById(roadmapId);
    if (!roadmap) throw new NotFoundException(`Roadmap ${roadmapId} not found`);

    const [items, userProgress] = await Promise.all([
      this.itemRepo.findByRoadmapId(roadmapId),
      this.progressRepo.findByUserAndRoadmap(userId, roadmapId),
    ]);

    const totalBanks = items.length;
    const bankIds = items.map((i) => i.questionBankId);
    const completedBankIds =
      bankIds.length > 0
        ? await this.bankProgressRepo.findCompletedBankIds(userId, bankIds)
        : [];

    const actualCompleted = completedBankIds.length;
    const hasStaleProgress =
      !!userProgress &&
      (userProgress.completedBanks !== actualCompleted ||
        userProgress.totalBanks !== totalBanks);
    const shouldAutoEnroll = !userProgress && actualCompleted > 0;
    const needsRepair = hasStaleProgress || shouldAutoEnroll;

    if (needsRepair) {
      const progressPercent =
        totalBanks > 0 ? Math.round((actualCompleted / totalBanks) * 100) : 0;
      const status =
        actualCompleted >= totalBanks && totalBanks > 0
          ? 'completed'
          : actualCompleted > 0
            ? 'in_progress'
            : (userProgress?.status ?? 'not_started');

      const repaired = await this.progressRepo.upsert({
        userId,
        roadmapId,
        totalBanks,
        completedBanks: actualCompleted,
        progressPercent,
        status,
        ...(userProgress?.currentBankId !== undefined && {
          currentBankId: userProgress.currentBankId,
        }),
        ...(userProgress?.lastAccessedBankId !== undefined && {
          lastAccessedBankId: userProgress.lastAccessedBankId,
        }),
        ...(userProgress?.startedAt !== undefined && {
          startedAt: userProgress.startedAt,
        }),
        ...(userProgress?.completedAt !== undefined && {
          completedAt: userProgress.completedAt,
        }),
        ...(status === 'completed' &&
          totalBanks > 0 && {
            completedAt: userProgress?.completedAt ?? new Date(),
          }),
      });

      return { roadmap, items, userProgress: repaired, completedBankIds };
    }

    return { roadmap, items, userProgress, completedBankIds };
  }
}
