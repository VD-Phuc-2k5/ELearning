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

export interface QuizResult {
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly score: number;
  readonly answers: ReadonlyArray<{
    readonly questionId: string;
    readonly isCorrect: boolean;
    readonly correctOptionId: string;
  }>;
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
