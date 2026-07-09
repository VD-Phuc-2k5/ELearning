'use server';

import {
  GetProblemsUsecase,
  GetProblemDetailUsecase,
  SubmitCodeUsecase,
  SubmitCodeParamsWithId,
  GetSubmissionStatusUsecase,
  GetSampleTestCasesUsecase,
} from '@learning-hub/domain';
import {
  ProblemRemoteDataSourceImpl,
  ProblemRepositoryImpl,
} from '@learning-hub/data';

function getRepo() {
  return new ProblemRepositoryImpl(new ProblemRemoteDataSourceImpl());
}

async function unwrapOrThrow<T>(
  promise: Promise<{ type: string; value: any }>,
): Promise<T> {
  const result = await promise;
  if (result.type === 'left') throw new Error(result.value.message);
  return result.value;
}

export async function getStudentProblems(): Promise<any> {
  try {
    return await unwrapOrThrow(
      new GetProblemsUsecase(getRepo()).execute({ status: 'public' }),
    );
  } catch {
    return { data: [], total: 0 };
  }
}

export async function getStudentProblemDetail(id: string): Promise<any> {
  try {
    return await unwrapOrThrow(
      new GetProblemDetailUsecase(getRepo()).execute(id),
    );
  } catch {
    return null;
  }
}

export async function getSampleTestCases(
  problemId: string,
): Promise<{ input: string; expectedOutput: string }[]> {
  try {
    return await unwrapOrThrow(
      new GetSampleTestCasesUsecase(getRepo()).execute(problemId),
    );
  } catch {
    return [];
  }
}

export async function submitStudentCode(
  problemId: string,
  data: { language: string; sourceCode: string },
): Promise<{ id: string; status: string }> {
  try {
    return unwrapOrThrow(
      new SubmitCodeUsecase(getRepo()).execute(
        new SubmitCodeParamsWithId(problemId, data),
      ),
    );
  } catch (e: any) {
    throw new Error(e?.message || 'Nộp bài thất bại');
  }
}

export async function getSubmissionStatus(submissionId: string): Promise<{
  status: string;
  score?: number;
  passedTestCases?: number;
  totalTestCases?: number;
  language?: string;
  sourceCode?: string;
  results?: Array<{
    testCaseId: string;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    status: string;
  }>;
}> {
  try {
    return await unwrapOrThrow(
      new GetSubmissionStatusUsecase(getRepo()).execute(submissionId),
    );
  } catch {
    return { status: 'error' };
  }
}
