import {
  Problem,
  TestCase,
  Submission,
  CreateProblemParams,
  UpdateProblemParams,
  CreateTestCaseParams,
  SubmitCodeParams,
  ProblemList,
  SampleTestCase,
} from '@learning-hub/domain';

export interface GetProblemsDataSourceParams {
  difficulty?: string;
  page?: number;
  limit?: number;
  status?: 'draft' | 'public';
}

export interface IProblemRemoteDataSource {
  getProblems(params?: GetProblemsDataSourceParams): Promise<ProblemList>;
  getProblemDetail(id: string): Promise<Problem>;
  createProblem(params: CreateProblemParams): Promise<Problem>;
  updateProblem(id: string, params: UpdateProblemParams): Promise<Problem>;
  deleteProblem(id: string): Promise<void>;

  getTestCases(problemId: string): Promise<TestCase[]>;
  getSampleTestCases(problemId: string): Promise<SampleTestCase[]>;
  createTestCase(
    problemId: string,
    params: CreateTestCaseParams,
  ): Promise<TestCase>;
  deleteTestCase(problemId: string, id: string): Promise<void>;
  importTestCases(
    problemId: string,
    file: Buffer,
    fileName: string,
  ): Promise<any>;
  getTestCasesTemplate(): Promise<{ data: string; contentType: string }>;

  submitCode(problemId: string, params: SubmitCodeParams): Promise<Submission>;
  getSubmissionStatus(submissionId: string): Promise<Submission>;
}
