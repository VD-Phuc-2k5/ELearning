export interface UserRoadmapProgress {
  readonly id: string;
  readonly userId: string;
  readonly roadmapId: string;
  readonly roadmapTitle?: string;
  readonly totalBanks: number;
  readonly completedBanks: number;
  readonly progressPercent: number;
  readonly status: 'not_started' | 'in_progress' | 'completed';
  readonly currentBankId: string | null;
  readonly lastAccessedBankId: string | null;
  readonly startedAt: string | null;
  readonly lastAccessedAt: string | null;
  readonly completedAt: string | null;
}
