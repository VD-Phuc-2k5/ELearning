import { Either, Failure } from '@learning-hub/core';
import {
  AnswerOptionInput,
  AttemptList,
  BankHashResult,
  BankList,
  BankRoadmapItem,
  DerivedBank,
  ParseExcelResult,
  Question,
  QuestionBank,
  QuizAnswer,
  QuizAttemptDetail,
  QuizSubmitResult,
  Tag,
  UploadExcelResult,
  UploadHistory,
  UserBankProgress,
  VerifyAnswerResult,
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
  answerOptions?: AnswerOptionInput[];
  correctOptionLabels?: string[];
}

export interface GetAttemptsParams {
  page?: number;
  limit?: number;
  bankId?: string;
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
  ): Promise<Either<Failure, UploadExcelResult>>;
  parseExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
  ): Promise<Either<Failure, ParseExcelResult>>;
  getUploadHistory(bankId: string): Promise<Either<Failure, UploadHistory[]>>;
  getQuestionsForQuiz(
    bankId: string,
    showAnswers?: boolean,
  ): Promise<Either<Failure, Question[]>>;
  verifyAnswer(
    questionId: string,
    selectedOptionId: string,
  ): Promise<Either<Failure, VerifyAnswerResult>>;
  submitQuiz(
    bankId: string,
    answers: QuizAnswer[],
    roadmapId?: string | null,
  ): Promise<Either<Failure, QuizSubmitResult>>;
  getAttempts(params: GetAttemptsParams): Promise<Either<Failure, AttemptList>>;
  getAttemptDetail(id: string): Promise<Either<Failure, QuizAttemptDetail>>;
  getBankProgress(
    bankId: string,
  ): Promise<Either<Failure, UserBankProgress | null>>;
  updateQuestion(
    id: string,
    params: UpdateQuestionQuizParams,
  ): Promise<Either<Failure, Question>>;
  deleteQuestion(id: string): Promise<Either<Failure, void>>;
  getTags(): Promise<Either<Failure, Tag[]>>;
  createTag(name: string): Promise<Either<Failure, Tag>>;
  deleteTag(id: number): Promise<Either<Failure, void>>;
  checkBankHash(hash: string): Promise<Either<Failure, BankHashResult>>;
  getDerivedBanks(bankId: string): Promise<Either<Failure, DerivedBank[]>>;
  getBankRoadmaps(bankId: string): Promise<Either<Failure, BankRoadmapItem[]>>;
}
