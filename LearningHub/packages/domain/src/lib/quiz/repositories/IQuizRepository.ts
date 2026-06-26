import { Either, Failure } from '@learning-hub/core';
import {
  BankList,
  Question,
  QuestionBank,
  QuizResult,
  Tag,
  UploadHistory,
} from '../entities/entities';

export interface GetBanksQuizParams {
  page?: number;
  limit?: number;
  search?: string;
  tagId?: number;
  statusId?: string;
}

export interface CreateBankQuizParams {
  title: string;
  description?: string;
  tagIds?: number[];
}

export interface UpdateBankQuizParams {
  title?: string;
  description?: string;
  statusId?: string;
  tagIds?: number[];
}

export interface UpdateQuestionQuizParams {
  content?: string;
  explanation?: string;
  answerOptions?: { optionLabel: string; content: string }[];
  correctOptionLabels?: string[];
}

export interface IQuizRepository {
  getBanks(params: GetBanksQuizParams): Promise<Either<Failure, BankList>>;
  getBankDetail(id: string): Promise<Either<Failure, QuestionBank>>;
  createBank(
    params: CreateBankQuizParams,
  ): Promise<Either<Failure, QuestionBank>>;
  updateBank(
    id: string,
    params: UpdateBankQuizParams,
  ): Promise<Either<Failure, QuestionBank>>;
  deleteBank(id: string): Promise<Either<Failure, void>>;
  uploadExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    fileHash?: string,
  ): Promise<
    Either<Failure, { message: string; totalQuestionsImported: number }>
  >;
  parseExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
  ): Promise<Either<Failure, { questions: unknown[] }>>;
  getUploadHistory(bankId: string): Promise<Either<Failure, UploadHistory[]>>;
  getQuestionsForQuiz(bankId: string): Promise<Either<Failure, Question[]>>;
  verifyAnswer(
    questionId: string,
    selectedOptionId: string,
  ): Promise<Either<Failure, { isCorrect: boolean; correctOptionId?: string }>>;
  submitQuiz(
    bankId: string,
    answers: { questionId: string; selectedOptionId: string }[],
  ): Promise<Either<Failure, QuizResult>>;
  updateQuestion(
    id: string,
    params: UpdateQuestionQuizParams,
  ): Promise<Either<Failure, Question>>;
  deleteQuestion(id: string): Promise<Either<Failure, void>>;
  getTags(): Promise<Either<Failure, Tag[]>>;
  checkBankHash(
    hash: string,
  ): Promise<Either<Failure, { exists: boolean; bank?: QuestionBank }>>;
}
