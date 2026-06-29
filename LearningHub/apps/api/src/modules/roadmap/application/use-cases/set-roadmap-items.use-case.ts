import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { RoadmapItemDomain } from '../../domain/entities/roadmap-item.domain';
import { RoadmapProgressStatus } from '../../domain/entities/user-roadmap-progress.domain';

@Injectable()
export class SetRoadmapItemsUseCase {
  constructor(
    @Inject(ROADMAP_REPOSITORY)
    private readonly roadmapRepo: IRoadmapRepository,
    @Inject(ROADMAP_ITEM_REPOSITORY)
    private readonly itemRepo: IRoadmapItemRepository,
    @Inject(USER_ROADMAP_PROGRESS_REPOSITORY)
    private readonly progressRepo: IUserRoadmapProgressRepository,
  ) {}

  async execute(
    roadmapId: string,
    bankIds: string[],
    userId: string,
  ): Promise<RoadmapItemDomain[]> {
    const roadmap = await this.roadmapRepo.findById(roadmapId);
    if (!roadmap) throw new NotFoundException(`Roadmap ${roadmapId} not found`);
    if (roadmap.creatorId !== userId)
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa roadmap này');

    const items = await this.itemRepo.setItems(roadmapId, bankIds);
    const newTotal = bankIds.length;

    // Recalculate all enrolled users' progress
    const allProgress = await this.progressRepo.findAllByRoadmap(roadmapId);
    await Promise.all(
      allProgress.map((p) => {
        const completedBanks = Math.min(p.completedBanks, newTotal);
        const progressPercent =
          newTotal > 0 ? Math.round((completedBanks / newTotal) * 100) : 0;
        const status: RoadmapProgressStatus =
          completedBanks >= newTotal && newTotal > 0
            ? 'completed'
            : completedBanks > 0
              ? 'in_progress'
              : 'not_started';
        return this.progressRepo.upsert({
          userId: p.userId,
          roadmapId,
          totalBanks: newTotal,
          completedBanks,
          progressPercent,
          status,
        });
      }),
    );

    return items;
  }
}
