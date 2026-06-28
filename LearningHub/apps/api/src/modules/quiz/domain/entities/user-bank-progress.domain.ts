export interface UserBankProgressDomain {
  id: string;
  userId: string;
  questionBankId: string;
  attemptCount: number;
  bestScore: number | null;
  latestScore: number | null;
  isCompleted: boolean;
  completedAt: Date | null;
  firstAttemptAt: Date | null;
  lastAccessedAt: Date | null;
}
