import {
  Either,
  Failure,
  UnknownFailure,
  AuthenticationFailure,
  PermissionFailure,
  NotFoundFailure,
  NetworkFailure,
  left,
  right,
  AuthenticationException,
  PermissionException,
  NotFoundException,
  NetworkException,
} from '@learning-hub/core';
import {
  IQuizRepository,
  GetBanksQuizParams,
  GetAttemptsParams,
  CreateBankQuizParams,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
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
} from '@learning-hub/domain';
import { IQuizRemoteDataSource } from '../datasources/IQuizRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure();
  if (e instanceof NotFoundException) return new NotFoundFailure();
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure();
}

export class QuizRepositoryImpl implements IQuizRepository {
  constructor(
    private dataSource: IQuizRemoteDataSource,
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
  ): Promise<Either<Failure, UploadExcelResult>> {
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
  ): Promise<Either<Failure, ParseExcelResult>> {
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
  ): Promise<Either<Failure, VerifyAnswerResult>> {
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
    answers: QuizAnswer[],
    roadmapId?: string | null,
  ): Promise<Either<Failure, QuizSubmitResult>> {
    try {
      return right(
        await this.dataSource.submitQuiz(
          bankId,
          answers,
          this.token,
          roadmapId,
        ),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getAttempts(
    params: GetAttemptsParams,
  ): Promise<Either<Failure, AttemptList>> {
    try {
      return right(await this.dataSource.getAttempts(params, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getAttemptDetail(
    id: string,
  ): Promise<Either<Failure, QuizAttemptDetail>> {
    try {
      return right(await this.dataSource.getAttemptDetail(id, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getBankProgress(
    bankId: string,
  ): Promise<Either<Failure, UserBankProgress | null>> {
    try {
      return right(await this.dataSource.getBankProgress(bankId, this.token));
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

  async checkBankHash(hash: string): Promise<Either<Failure, BankHashResult>> {
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
      return right(await this.dataSource.getDerivedBanks(bankId, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getBankRoadmaps(
    bankId: string,
  ): Promise<Either<Failure, BankRoadmapItem[]>> {
    try {
      return right(await this.dataSource.getBankRoadmaps(bankId, this.token));
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
