'use server';

import { unwrap } from '@learning-hub/core';
import {
  GetProblemsUsecase,
  GetProblemDetailUsecase,
  SubmitCodeUsecase,
  SubmitCodeParamsWithId,
  GetSubmissionStatusUsecase,
} from '@learning-hub/domain';
import {
  ProblemRemoteDataSourceImpl,
  ProblemRepositoryImpl,
} from '@learning-hub/data';

function getRepo() {
  return new ProblemRepositoryImpl(new ProblemRemoteDataSourceImpl());
}

export async function getStudentProblems() {
  return unwrap(await new GetProblemsUsecase(getRepo()).execute(undefined));
}

export async function getStudentProblemDetail(id: string) {
  return unwrap(await new GetProblemDetailUsecase(getRepo()).execute(id));
}

export async function submitStudentCode(
  problemId: string,
  data: { language: string; sourceCode: string },
) {
  return unwrap(
    await new SubmitCodeUsecase(getRepo()).execute(
      new SubmitCodeParamsWithId(problemId, data),
    ),
  );
}

export async function getSubmissionStatus(submissionId: string) {
  return unwrap(
    await new GetSubmissionStatusUsecase(getRepo()).execute(submissionId),
  );
}
