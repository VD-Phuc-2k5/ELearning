import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRoadmapProgressRepository,
  USER_ROADMAP_PROGRESS_REPOSITORY,
} from '../../domain/repositories/user-roadmap-progress.repository.interface';
import { UserRoadmapProgressDomain } from '../../domain/entities/user-roadmap-progress.domain';

@Injectable()
export class GetMyRoadmapProgressUseCase {
  constructor(
    @Inject(USER_ROADMAP_PROGRESS_REPOSITORY)
    private readonly progressRepo: IUserRoadmapProgressRepository,
  ) {}

  execute(userId: string): Promise<UserRoadmapProgressDomain[]> {
    return this.progressRepo.findAllByUser(userId);
  }
}
