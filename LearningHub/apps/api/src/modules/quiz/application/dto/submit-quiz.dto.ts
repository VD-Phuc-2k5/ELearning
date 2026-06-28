export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionId: string;
}
export interface SubmitQuizDto {
  answers: SubmitAnswerItem[];
  roadmapId?: string | null;
  durationSeconds?: number;
}

export interface SubmitQuizResultDetail {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionIds: string[];
  explanation: string | null;
}

export interface NextBankSuggestion {
  bankId: string;
  bankTitle: string;
  position: number;
  totalBanks: number;
  roadmapId: string;
}

export interface SubmitQuizResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  scorePercent: number;
  details: SubmitQuizResultDetail[];
  attemptId: string;
  nextBank: NextBankSuggestion | null;
}
