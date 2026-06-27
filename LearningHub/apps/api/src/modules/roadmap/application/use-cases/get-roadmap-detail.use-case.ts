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

    const bankIds = items.map((i) => i.questionBankId);
    const completedBankIds =
      bankIds.length > 0
        ? await this.bankProgressRepo.findCompletedBankIds(userId, bankIds)
        : [];

    return { roadmap, items, userProgress, completedBankIds };
  }
}
