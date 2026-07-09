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
  BadRequestException,
  PermissionException,
  NotFoundException,
  NetworkException,
} from '@learning-hub/core';
import {
  Problem,
  TestCase,
  Submission,
  CreateProblemParams,
  UpdateProblemParams,
  CreateTestCaseParams,
  SubmitCodeParams,
  ProblemList,
  IProblemRepository,
  GetProblemsParams,
  SampleTestCase,
} from '@learning-hub/domain';
import { IProblemRemoteDataSource } from '../datasources/IProblemRemoteDataSource';

function toFailure(e: unknown): Failure {
  if (e instanceof AuthenticationException)
    return new AuthenticationFailure(e.message);
  if (e instanceof PermissionException) return new PermissionFailure(e.message);
  if (e instanceof NotFoundException) return new NotFoundFailure(e.message);
  if (e instanceof BadRequestException) return new UnknownFailure(e.message);
  if (e instanceof NetworkException) return new NetworkFailure();
  return new UnknownFailure(e instanceof Error ? e.message : undefined);
}

export class ProblemRepositoryImpl implements IProblemRepository {
  constructor(private dataSource: IProblemRemoteDataSource) {}

  async getProblems(
    params?: GetProblemsParams,
  ): Promise<Either<Failure, ProblemList>> {
    try {
      return right(await this.dataSource.getProblems(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getProblemDetail(id: string): Promise<Either<Failure, Problem>> {
    try {
      return right(await this.dataSource.getProblemDetail(id));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createProblem(
    params: CreateProblemParams,
  ): Promise<Either<Failure, Problem>> {
    try {
      return right(await this.dataSource.createProblem(params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async updateProblem(
    id: string,
    params: UpdateProblemParams,
  ): Promise<Either<Failure, Problem>> {
    try {
      return right(await this.dataSource.updateProblem(id, params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteProblem(id: string): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteProblem(id);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getTestCases(problemId: string): Promise<Either<Failure, TestCase[]>> {
    try {
      return right(await this.dataSource.getTestCases(problemId));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getSampleTestCases(
    problemId: string,
  ): Promise<Either<Failure, SampleTestCase[]>> {
    try {
      return right(await this.dataSource.getSampleTestCases(problemId));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async createTestCase(
    problemId: string,
    params: CreateTestCaseParams,
  ): Promise<Either<Failure, TestCase>> {
    try {
      return right(await this.dataSource.createTestCase(problemId, params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async deleteTestCase(
    problemId: string,
    id: string,
  ): Promise<Either<Failure, void>> {
    try {
      await this.dataSource.deleteTestCase(problemId, id);
      return right(undefined);
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async importTestCases(
    problemId: string,
    file: Buffer,
    fileName: string,
  ): Promise<Either<Failure, any>> {
    try {
      return right(
        await this.dataSource.importTestCases(problemId, file, fileName),
      );
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getTestCasesTemplate(): Promise<
    Either<Failure, { data: string; contentType: string }>
  > {
    try {
      return right(await this.dataSource.getTestCasesTemplate());
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async submitCode(
    problemId: string,
    params: SubmitCodeParams,
  ): Promise<Either<Failure, Submission>> {
    try {
      return right(await this.dataSource.submitCode(problemId, params));
    } catch (e) {
      return left(toFailure(e));
    }
  }

  async getSubmissionStatus(
    submissionId: string,
  ): Promise<Either<Failure, Submission>> {
    try {
      return right(await this.dataSource.getSubmissionStatus(submissionId));
    } catch (e) {
      return left(toFailure(e));
    }
  }
}
