import { QuestionBankDomain } from '../entities/question-bank.domain';

export interface CreateQuestionBankInput {
  title: string;
  description?: string;
  uploaderId: string;
  tagIds?: number[];
}

export interface GetQuestionBankListInput {
  page?: number;
  limit?: number;
  search?: string;
  tagId?: number;
  statusId?: string;
}

export interface IQuestionBankRepository {
  create(input: CreateQuestionBankInput): Promise<QuestionBankDomain>;
  findAll(input: GetQuestionBankListInput): Promise<{ data: QuestionBankDomain[]; total: number }>;
  findById(id: string): Promise<QuestionBankDomain | null>;
  updateTotalQuestions(id: string, total: number): Promise<void>;
}

export const QUESTION_BANK_REPOSITORY = Symbol('IQuestionBankRepository');
