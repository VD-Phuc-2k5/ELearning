'use server';

import { unwrap } from '@learning-hub/core';
import {
  CreateProblemUsecase,
  CreateTestCaseParamsWithId,
  CreateTestCaseUsecase,
  DeleteProblemUsecase,
  DeleteTestCaseParams,
  DeleteTestCaseUsecase,
  GetProblemsUsecase,
  GetTestCasesTemplateUsecase,
  GetTestCasesUsecase,
  ImportTestCasesParams,
  ImportTestCasesUsecase,
  UpdateProblemParamsWithId,
  UpdateProblemUsecase,
} from '@learning-hub/domain';
import {
  ProblemRemoteDataSourceImpl,
  ProblemRepositoryImpl,
} from '@learning-hub/data';

function getRepo() {
  return new ProblemRepositoryImpl(new ProblemRemoteDataSourceImpl());
}

export async function getProblems() {
  return unwrap(await new GetProblemsUsecase(getRepo()).execute(undefined));
}

export async function createProblem(data: {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitMs: number;
  memoryLimitMb: number;
  languages: string[];
  templates?: Record<string, string>;
  wrappers?: Record<string, string>;
}) {
  return unwrap(
    await new CreateProblemUsecase(getRepo()).execute({
      ...data,
      sampleInput: null,
      sampleOutput: null,
    }),
  );
}

export async function getTestCases(problemId: string) {
  return unwrap(await new GetTestCasesUsecase(getRepo()).execute(problemId));
}

export async function createTestCase(
  problemId: string,
  data: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
    orderIndex?: number;
    points?: number;
  },
) {
  return unwrap(
    await new CreateTestCaseUsecase(getRepo()).execute(
      new CreateTestCaseParamsWithId(problemId, data),
    ),
  );
}

export async function deleteTestCase(problemId: string, id: string) {
  return unwrap(
    await new DeleteTestCaseUsecase(getRepo()).execute(
      new DeleteTestCaseParams(problemId, id),
    ),
  );
}

export async function updateTestCase(
  problemId: string,
  id: string,
  data: {
    input?: string;
    expectedOutput?: string;
    isHidden?: boolean;
    points?: number;
    orderIndex?: number;
  },
) {
  return unwrap(await getRepo().updateTestCase(problemId, id, data));
}

export async function updateProblem(
  id: string,
  data: {
    title?: string;
    description?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    timeLimitMs?: number;
    memoryLimitMb?: number;
    sampleInput?: string | null;
    sampleOutput?: string | null;
    languages?: string[];
    templates?: Record<string, string>;
    wrappers?: Record<string, string>;
  },
) {
  return unwrap(
    await new UpdateProblemUsecase(getRepo()).execute(
      new UpdateProblemParamsWithId(id, data),
    ),
  );
}

export async function deleteProblem(id: string) {
  return unwrap(await new DeleteProblemUsecase(getRepo()).execute(id));
}

export async function toggleProblemStatus(
  id: string,
  status: 'draft' | 'public',
) {
  return unwrap(
    await new UpdateProblemUsecase(getRepo()).execute(
      new UpdateProblemParamsWithId(id, { status }),
    ),
  );
}

export async function importTestCases(problemId: string, formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('Vui lòng chọn file Excel để import.');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return unwrap(
    await new ImportTestCasesUsecase(getRepo()).execute(
      new ImportTestCasesParams(problemId, buffer, file.name),
    ),
  );
}

export async function getTestCasesTemplate() {
  return unwrap(await new GetTestCasesTemplateUsecase(getRepo()).execute({}));
}
