export interface SubmitAnswerItem {
  questionId: string;
  selectedOptionId: string;
}
export interface SubmitQuizDto {
  answers: SubmitAnswerItem[];
  roadmapId?: string | null;
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
