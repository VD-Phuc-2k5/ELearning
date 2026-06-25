import { QuestionDomain } from '../entities/question.domain';

export interface CreateQuestionInput {
  questionBankId: string;
  content: string;
  explanation?: string;
  answerOptions: { optionLabel: string; content: string }[];
  correctOptionLabels: string[];
}

export interface IQuestionRepository {
  createMany(questions: CreateQuestionInput[]): Promise<void>;
  findByBankId(bankId: string, hideAnswers: boolean): Promise<QuestionDomain[]>;
  findById(id: string): Promise<QuestionDomain | null>;
}

export const QUESTION_REPOSITORY = Symbol('IQuestionRepository');
