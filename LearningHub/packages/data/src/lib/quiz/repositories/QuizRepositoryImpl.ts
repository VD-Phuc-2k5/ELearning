import {
  Either,
  Failure,
  UnknownFailure,
  AuthenticationFailure,
  left,
  right,
} from '@learning-hub/core';
import {
  IQuizRepository,
  GetBanksQuizParams,
  CreateBankQuizParams,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
  BankList,
  DerivedBank,
  Question,
  QuestionBank,
  QuizResult,
  Tag,
  UploadHistory,
} from '@learning-hub/domain';
import { QuizRemoteDataSourceImpl } from '../datasources/QuizRemoteDataSourceImpl';

const toFailure = (e: unknown): Failure =>
  (e as any)?.response?.status === 401
    ? new AuthenticationFailure('Unauthorized')
    : new UnknownFailure();

export class QuizRepositoryImpl implements IQuizRepository {
  constructor(
    private dataSource: QuizRemoteDataSourceImpl,
    private token: string,
  ) {}

  async getBanks(
    params: GetBanksQuizParams,
  ): Promise<Either<Failure, BankList>> {
    try {
      return right(await this.dataSource.getBanks(params, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getBankDetail(id: string): Promise<Either<Failure, QuestionBank>> {
    try {
      return right(await this.dataSource.getBankDetail(id, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createBank(
    params: CreateBankQuizParams,
  ): Promise<Either<Failure, QuestionBank>> {
    try {
      return right(await this.dataSource.createBank(params, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateBank(
    id: string,
    params: UpdateBankQuizParams,
  ): Promise<Either<Failure, QuestionBank>> {
    try {
      return right(await this.dataSource.updateBank(id, params, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteBank(id: string): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteBank(id, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async uploadExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
    fileHash?: string,
  ): Promise<
    Either<Failure, { message: string; totalQuestionsImported: number }>
  > {
    try {
      return right(
        await this.dataSource.uploadExcel(
          bankId,
          file,
          fileName,
          this.token,
          fileHash,
        ),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async parseExcel(
    bankId: string,
    file: Buffer,
    fileName: string,
  ): Promise<Either<Failure, { questions: unknown[] }>> {
    try {
      return right(
        await this.dataSource.parseExcel(bankId, file, fileName, this.token),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getUploadHistory(
    bankId: string,
  ): Promise<Either<Failure, UploadHistory[]>> {
    try {
      return right(await this.dataSource.getUploadHistory(bankId, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getQuestionsForQuiz(
    bankId: string,
    showAnswers = false,
  ): Promise<Either<Failure, Question[]>> {
    try {
      return right(
        await this.dataSource.getQuestionsForQuiz(
          bankId,
          this.token,
          showAnswers,
        ),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async verifyAnswer(
    questionId: string,
    selectedOptionId: string,
  ): Promise<
    Either<Failure, { isCorrect: boolean; correctOptionId?: string }>
  > {
    try {
      return right(
        await this.dataSource.verifyAnswer(
          questionId,
          selectedOptionId,
          this.token,
        ),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async submitQuiz(
    bankId: string,
    answers: { questionId: string; selectedOptionId: string }[],
  ): Promise<Either<Failure, QuizResult>> {
    try {
      return right(
        await this.dataSource.submitQuiz(bankId, answers, this.token),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateQuestion(
    id: string,
    params: UpdateQuestionQuizParams,
  ): Promise<Either<Failure, Question>> {
    try {
      return right(
        await this.dataSource.updateQuestion(id, params, this.token),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteQuestion(id: string): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteQuestion(id, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getTags(): Promise<Either<Failure, Tag[]>> {
    try {
      return right(await this.dataSource.getTags(this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createTag(name: string): Promise<Either<Failure, Tag>> {
    try {
      return right(await this.dataSource.createTag(name, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteTag(id: number): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteTag(id, this.token);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async checkBankHash(
    hash: string,
  ): Promise<Either<Failure, { exists: boolean; bank?: QuestionBank }>> {
    try {
      return right(await this.dataSource.checkBankHash(hash, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getDerivedBanks(
    bankId: string,
  ): Promise<Either<Failure, DerivedBank[]>> {
    try {
      const res = await this.dataSource.getDerivedBanks(bankId, this.token);
      return right(res.data ?? []);
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
