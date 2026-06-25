export interface QuestionDomain {
  id: string;
  questionBankId: string;
  content: string;
  explanation: string | null;
  answerOptions: AnswerOptionDomain[];
  correctAnswerOptionIds: string[];
}

export interface AnswerOptionDomain {
  id: string;
  optionLabel: string;
  content: string;
}
