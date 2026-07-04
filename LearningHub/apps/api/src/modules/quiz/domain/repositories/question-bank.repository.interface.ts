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
  uploaderId?: string;
}

export interface UpdateQuestionBankInput {
  title?: string;
  description?: string;
  statusId?: string;
  tagIds?: number[];
  fileHash?: string;
  rejectReason?: string | null;
}

export interface IQuestionBankRepository {
  create(input: CreateQuestionBankInput): Promise<QuestionBankDomain>;
  findAll(
    input: GetQuestionBankListInput,
  ): Promise<{ data: QuestionBankDomain[]; total: number }>;
  findById(id: string): Promise<QuestionBankDomain | null>;
  updateTotalQuestions(id: string, total: number): Promise<void>;
  update(
    id: string,
    input: UpdateQuestionBankInput,
  ): Promise<QuestionBankDomain>;
  delete(id: string): Promise<void>;
  findByHash(
    hash: string,
    uploaderId?: string,
  ): Promise<QuestionBankDomain | null>;
  findDerivedBanks(
    fileHash: string,
    excludeUploaderId: string,
  ): Promise<
    Array<{
      id: string;
      title: string;
      createdAt: Date;
      uploaderUsername: string;
    }>
  >;
  findOriginalByHash(fileHash: string): Promise<QuestionBankDomain | null>;
}

export const QUESTION_BANK_REPOSITORY = Symbol('IQuestionBankRepository');
