import {
  QuizAttemptAnswerDomain,
  QuizAttemptDomain,
  QuizAttemptStatus,
} from '../entities/quiz-attempt.domain';

export interface CreateAttemptAnswerInput {
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  questionOrder: number;
}

export interface CreateAttemptInput {
  userId: string;
  questionBankId: string;
  startedAt: Date;
  finishedAt: Date;
  durationSeconds: number;
  scorePercent: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  status: QuizAttemptStatus;
  answers: CreateAttemptAnswerInput[];
}

export interface IQuizAttemptRepository {
  create(input: CreateAttemptInput): Promise<QuizAttemptDomain>;
  findByUser(
    userId: string,
    input: { page?: number; limit?: number; bankId?: string },
  ): Promise<{ data: QuizAttemptDomain[]; total: number }>;
  findById(
    id: string,
  ): Promise<
    (QuizAttemptDomain & { answers: QuizAttemptAnswerDomain[] }) | null
  >;
}

export const QUIZ_ATTEMPT_REPOSITORY = Symbol('IQuizAttemptRepository');
