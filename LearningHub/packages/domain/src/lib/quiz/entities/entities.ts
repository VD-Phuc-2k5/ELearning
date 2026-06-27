export interface Tag {
  readonly id: number;
  readonly name: string;
  readonly description?: string;
}

export interface QuestionBank {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly uploaderId: string;
  readonly fileHash?: string;
  readonly totalQuestions: number;
  readonly statusId: string;
  readonly tags?: Tag[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AnswerOption {
  readonly id: string;
  readonly optionLabel: string;
  readonly content: string;
}

export interface Question {
  readonly id: string;
  readonly content: string;
  readonly explanation?: string;
  readonly answerOptions: AnswerOption[];
  readonly correctAnswerOptionIds?: string[];
}

export interface UploadHistory {
  readonly id: string;
  readonly questionBankId: string;
  readonly uploadedBy: string;
  readonly fileName?: string;
  readonly totalQuestionsImported: number;
  readonly uploadedAt: string;
}

export interface QuizResultAnswer {
  readonly questionId: string;
  readonly isCorrect: boolean;
  readonly correctOptionId: string;
}

export interface QuizResult {
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly score: number;
  readonly answers: ReadonlyArray<QuizResultAnswer>;
}

export interface QuizAnswer {
  readonly questionId: string;
  readonly selectedOptionId: string;
}

export interface AnswerOptionInput {
  readonly optionLabel: string;
  readonly content: string;
}

export interface BankHashResult {
  readonly exists: boolean;
  readonly bank?: QuestionBank;
}

export interface UploadExcelResult {
  readonly message: string;
  readonly totalQuestionsImported: number;
}

export interface VerifyAnswerResult {
  readonly isCorrect: boolean;
  readonly correctOptionId?: string;
}

export interface ParseExcelResult {
  readonly questions: unknown[];
}

export interface BankList {
  readonly data: QuestionBank[];
  readonly total: number;
}

export interface DerivedBank {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly uploaderUsername: string;
}

export interface NextBankSuggestion {
  readonly bankId: string;
  readonly bankTitle: string;
  readonly position: number;
  readonly totalBanks: number;
}

export interface QuizSubmitResult {
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly wrongCount: number;
  readonly scorePercent: number;
  readonly attemptId: string;
  readonly nextBank: NextBankSuggestion | null;
}

export interface QuizAttempt {
  readonly id: string;
  readonly userId: string;
  readonly questionBankId: string;
  readonly startedAt: string;
  readonly finishedAt: string | null;
  readonly durationSeconds: number | null;
  readonly scorePercent: number | null;
  readonly correctCount: number;
  readonly wrongCount: number;
  readonly totalQuestions: number;
  readonly status: 'in_progress' | 'pass' | 'fail';
  readonly createdAt: string;
}

export interface QuizAttemptAnswer {
  readonly questionId: string;
  readonly questionContent: string;
  readonly explanation: string | null;
  readonly selectedOptionId: string | null;
  readonly correctOptionIds: string[];
  readonly isCorrect: boolean;
  readonly questionOrder: number;
  readonly answerOptions: ReadonlyArray<{
    id: string;
    optionLabel: string;
    content: string;
  }>;
}

export interface QuizAttemptDetail {
  readonly attempt: QuizAttempt;
  readonly reviewDetails: QuizAttemptAnswer[];
}

export interface UserBankProgress {
  readonly attemptCount: number;
  readonly bestScore: number | null;
  readonly latestScore: number | null;
  readonly isCompleted: boolean;
}

export interface AttemptList {
  readonly data: QuizAttempt[];
  readonly total: number;
}

export interface BankRoadmapItem {
  readonly roadmapId: string;
  readonly roadmapTitle: string;
  readonly position: number;
}
