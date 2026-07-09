import { Either, Failure } from '@learning-hub/core';
import {
  Problem,
  TestCase,
  Submission,
  CreateProblemParams,
  UpdateProblemParams,
  CreateTestCaseParams,
  UpdateTestCaseParams,
  SubmitCodeParams,
  SampleTestCase,
} from '../entities/entities';

export interface GetProblemsParams {
  difficulty?: string;
  page?: number;
  limit?: number;
  status?: 'draft' | 'public';
}

export interface ProblemList {
  readonly data: Problem[];
  readonly total: number;
}

export interface IProblemRepository {
  getProblems(
    params?: GetProblemsParams,
  ): Promise<Either<Failure, ProblemList>>;
  getProblemDetail(id: string): Promise<Either<Failure, Problem>>;
  createProblem(params: CreateProblemParams): Promise<Either<Failure, Problem>>;
  updateProblem(
    id: string,
    params: UpdateProblemParams,
  ): Promise<Either<Failure, Problem>>;
  deleteProblem(id: string): Promise<Either<Failure, void>>;

  getTestCases(problemId: string): Promise<Either<Failure, TestCase[]>>;
  getSampleTestCases(
    problemId: string,
  ): Promise<Either<Failure, SampleTestCase[]>>;
  createTestCase(
    problemId: string,
    params: CreateTestCaseParams,
  ): Promise<Either<Failure, TestCase>>;
  updateTestCase(
    problemId: string,
    id: string,
    params: UpdateTestCaseParams,
  ): Promise<Either<Failure, TestCase>>;
  deleteTestCase(problemId: string, id: string): Promise<Either<Failure, void>>;
  importTestCases(
    problemId: string,
    file: Buffer,
    fileName: string,
  ): Promise<Either<Failure, any>>;
  getTestCasesTemplate(): Promise<
    Either<Failure, { data: string; contentType: string }>
  >;

  submitCode(
    problemId: string,
    params: SubmitCodeParams,
  ): Promise<Either<Failure, Submission>>;
  getSubmissionStatus(
    submissionId: string,
  ): Promise<Either<Failure, Submission>>;
}
export const IProblemRepository = Symbol('IProblemRepository');
