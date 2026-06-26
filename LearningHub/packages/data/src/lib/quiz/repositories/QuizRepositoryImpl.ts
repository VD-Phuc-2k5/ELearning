import { Either, Failure, UnknownFailure, left, right } from '@learning-hub/core';
import {
  IQuizRepository,
  GetBanksQuizParams,
  CreateBankQuizParams,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
  BankList,
  Question,
  QuestionBank,
  QuizResult,
  Tag,
  UploadHistory,
} from '@learning-hub/domain';
import { QuizRemoteDataSourceImpl } from '../datasources/QuizRemoteDataSourceImpl';

export class QuizRepositoryImpl implements IQuizRepository {
  constructor(
    private dataSource: QuizRemoteDataSourceImpl,
    private token: string,
  ) {}

  async getBanks(params: GetBanksQuizParams): Promise<Either<Failure, BankList>> {
    try { return right(await this.dataSource.getBanks(params, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async getBankDetail(id: string): Promise<Either<Failure, QuestionBank>> {
    try { return right(await this.dataSource.getBankDetail(id, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async createBank(params: CreateBankQuizParams): Promise<Either<Failure, QuestionBank>> {
    try { return right(await this.dataSource.createBank(params, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async updateBank(id: string, params: UpdateBankQuizParams): Promise<Either<Failure, QuestionBank>> {
    try { return right(await this.dataSource.updateBank(id, params, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async deleteBank(id: string): Promise<Either<Failure, void>> {
    try { await this.dataSource.deleteBank(id, this.token); return right(undefined); }
    catch { return left(new UnknownFailure()); }
  }

  async uploadExcel(bankId: string, file: Buffer, fileName: string, fileHash?: string): Promise<Either<Failure, { message: string; totalQuestionsImported: number }>> {
    try { return right(await this.dataSource.uploadExcel(bankId, file, fileName, this.token, fileHash)); }
    catch { return left(new UnknownFailure()); }
  }

  async parseExcel(bankId: string, file: Buffer, fileName: string): Promise<Either<Failure, { questions: unknown[] }>> {
    try { return right(await this.dataSource.parseExcel(bankId, file, fileName, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async getUploadHistory(bankId: string): Promise<Either<Failure, UploadHistory[]>> {
    try { return right(await this.dataSource.getUploadHistory(bankId, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async getQuestionsForQuiz(bankId: string): Promise<Either<Failure, Question[]>> {
    try { return right(await this.dataSource.getQuestionsForQuiz(bankId, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async verifyAnswer(questionId: string, selectedOptionId: string): Promise<Either<Failure, { isCorrect: boolean; correctOptionId?: string }>> {
    try { return right(await this.dataSource.verifyAnswer(questionId, selectedOptionId, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async submitQuiz(bankId: string, answers: { questionId: string; selectedOptionId: string }[]): Promise<Either<Failure, QuizResult>> {
    try { return right(await this.dataSource.submitQuiz(bankId, answers, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async updateQuestion(id: string, params: UpdateQuestionQuizParams): Promise<Either<Failure, Question>> {
    try { return right(await this.dataSource.updateQuestion(id, params, this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async deleteQuestion(id: string): Promise<Either<Failure, void>> {
    try { await this.dataSource.deleteQuestion(id, this.token); return right(undefined); }
    catch { return left(new UnknownFailure()); }
  }

  async getTags(): Promise<Either<Failure, Tag[]>> {
    try { return right(await this.dataSource.getTags(this.token)); }
    catch { return left(new UnknownFailure()); }
  }

  async checkBankHash(hash: string): Promise<Either<Failure, { exists: boolean; bank?: QuestionBank }>> {
    try { return right(await this.dataSource.checkBankHash(hash, this.token)); }
    catch { return left(new UnknownFailure()); }
  }
}
