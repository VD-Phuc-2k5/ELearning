export type RoadmapProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserRoadmapProgressDomain {
  id: string;
  userId: string;
  roadmapId: string;
  roadmapTitle?: string;
  totalBanks: number;
  completedBanks: number;
  progressPercent: number;
  status: RoadmapProgressStatus;
  currentBankId: string | null;
  lastAccessedBankId: string | null;
  startedAt: Date | null;
  lastAccessedAt: Date | null;
  completedAt: Date | null;
}
