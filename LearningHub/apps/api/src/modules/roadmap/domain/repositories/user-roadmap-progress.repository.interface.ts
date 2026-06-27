import {
  RoadmapProgressStatus,
  UserRoadmapProgressDomain,
} from '../entities/user-roadmap-progress.domain';

export interface UpsertRoadmapProgressInput {
  userId: string;
  roadmapId: string;
  totalBanks: number;
  completedBanks: number;
  progressPercent: number;
  status: RoadmapProgressStatus;
  currentBankId?: string | null;
  lastAccessedBankId?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface IUserRoadmapProgressRepository {
  upsert(input: UpsertRoadmapProgressInput): Promise<UserRoadmapProgressDomain>;
  findByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<UserRoadmapProgressDomain | null>;
  findAllByUser(userId: string): Promise<UserRoadmapProgressDomain[]>;
  findAllByRoadmap(roadmapId: string): Promise<UserRoadmapProgressDomain[]>;
}

export const USER_ROADMAP_PROGRESS_REPOSITORY = Symbol(
  'IUserRoadmapProgressRepository',
);
