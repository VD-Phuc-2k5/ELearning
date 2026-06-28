export type QuizAttemptStatus = 'in_progress' | 'pass' | 'fail';

export interface QuizAttemptDomain {
  id: string;
  userId: string;
  questionBankId: string;
  startedAt: Date;
  finishedAt: Date | null;
  durationSeconds: number | null;
  scorePercent: number | null;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  status: QuizAttemptStatus;
  createdAt: Date;
}

export interface QuizAttemptAnswerDomain {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  timeSpentSeconds: number | null;
  questionOrder: number;
}
