'use server';

import { unwrap } from '@learning-hub/core';
import {
  QuizRemoteDataSourceImpl,
  QuizRepositoryImpl,
} from '@learning-hub/data';
import type {
  BankHashResult,
  BankList,
  BankRoadmapItem,
  CreateBankQuizParams,
  DerivedBank,
  GetBanksQuizParams,
  Question,
  QuestionBank,
  QuizAnswer,
  QuizSubmitResult,
  Tag,
  UpdateBankQuizParams,
  UpdateQuestionQuizParams,
  UploadHistory,
  VerifyAnswerResult,
} from '@learning-hub/domain';
import type { ParsedQuestion } from '@learning-hub/domain';
import {
  CheckBankHashQuizParams,
  CheckBankHashQuizUsecase,
  CreateBankQuizUsecase,
  CreateTagQuizParams,
  CreateTagQuizUsecase,
  DeleteBankQuizParams,
  DeleteBankQuizUsecase,
  DeleteQuestionQuizParams,
  DeleteQuestionQuizUsecase,
  DeleteTagQuizParams,
  DeleteTagQuizUsecase,
  GetBankDetailQuizParams,
  GetBankDetailQuizUsecase,
  GetBankRoadmapsQuizParams,
  GetBankRoadmapsQuizUsecase,
  GetBanksQuizUsecase,
  GetDerivedBanksQuizParams,
  GetDerivedBanksQuizUsecase,
  GetQuestionsForQuizParams,
  GetQuestionsForQuizUsecase,
  GetTagsQuizUsecase,
  GetUploadHistoryQuizParams,
  GetUploadHistoryQuizUsecase,
  ParseExcelQuizParams,
  ParseExcelQuizUsecase,
  SubmitQuizParams,
  SubmitQuizUsecase,
  UpdateBankCommand,
  UpdateBankQuizUsecase,
  UpdateQuestionCommand,
  UpdateQuestionQuizUsecase,
  UploadExcelQuizParams,
  UploadExcelQuizUsecase,
  VerifyAnswerQuizParams,
  VerifyAnswerQuizUsecase,
} from '@learning-hub/domain';
function getRepo() {
  return new QuizRepositoryImpl(new QuizRemoteDataSourceImpl());
}

export async function getBanks(params?: GetBanksQuizParams): Promise<BankList> {
  const repo = getRepo();
  const result = await new GetBanksQuizUsecase(repo).execute(params ?? {});
  return result.type === 'right' ? result.value : { data: [], total: 0 };
}

export async function getBankDetail(id: string): Promise<QuestionBank> {
  const repo = getRepo();
  return unwrap(
    await new GetBankDetailQuizUsecase(repo).execute(
      new GetBankDetailQuizParams(id),
    ),
  );
}

export async function createBank(
  data: CreateBankQuizParams,
): Promise<QuestionBank> {
  const repo = getRepo();
  return unwrap(await new CreateBankQuizUsecase(repo).execute(data));
}

export async function updateBank(
  id: string,
  data: UpdateBankQuizParams,
): Promise<QuestionBank> {
  const repo = getRepo();
  return unwrap(
    await new UpdateBankQuizUsecase(repo).execute(
      new UpdateBankCommand(id, data),
    ),
  );
}

export async function deleteBank(id: string): Promise<void> {
  const repo = getRepo();
  unwrap(
    await new DeleteBankQuizUsecase(repo).execute(new DeleteBankQuizParams(id)),
  );
}

export async function uploadExcel(
  bankId: string,
  file: File,
  fileHash?: string,
): Promise<{ message: string }> {
  const repo = getRepo();
  const buffer = Buffer.from(await file.arrayBuffer());
  return unwrap(
    await new UploadExcelQuizUsecase(repo).execute(
      new UploadExcelQuizParams(bankId, buffer, file.name, fileHash),
    ),
  );
}

export async function getUploadHistory(
  bankId: string,
): Promise<UploadHistory[]> {
  const repo = getRepo();
  return unwrap(
    await new GetUploadHistoryQuizUsecase(repo).execute(
      new GetUploadHistoryQuizParams(bankId),
    ),
  );
}

export async function getQuestionsForQuiz(
  bankId: string,
  showAnswers = false,
): Promise<Question[]> {
  const repo = getRepo();
  return unwrap(
    await new GetQuestionsForQuizUsecase(repo).execute(
      new GetQuestionsForQuizParams(bankId, showAnswers),
    ),
  );
}

export async function verifyAnswer(
  questionId: string,
  selectedOptionId: string,
): Promise<VerifyAnswerResult> {
  const repo = getRepo();
  return unwrap(
    await new VerifyAnswerQuizUsecase(repo).execute(
      new VerifyAnswerQuizParams(questionId, selectedOptionId),
    ),
  );
}

export async function submitQuiz(
  bankId: string,
  answers: QuizAnswer[],
  roadmapId?: string | null,
  durationSeconds?: number,
): Promise<QuizSubmitResult> {
  const repo = getRepo();
  return unwrap(
    await new SubmitQuizUsecase(repo).execute(
      new SubmitQuizParams(bankId, answers, roadmapId, durationSeconds),
    ),
  );
}

export async function updateQuestion(
  id: string,
  data: UpdateQuestionQuizParams,
): Promise<Question> {
  const repo = getRepo();
  return unwrap(
    await new UpdateQuestionQuizUsecase(repo).execute(
      new UpdateQuestionCommand(id, data),
    ),
  );
}

export async function deleteQuestion(id: string): Promise<void> {
  const repo = getRepo();
  unwrap(
    await new DeleteQuestionQuizUsecase(repo).execute(
      new DeleteQuestionQuizParams(id),
    ),
  );
}

export async function getTags(): Promise<Tag[]> {
  try {
    const repo = getRepo();
    return unwrap(await new GetTagsQuizUsecase(repo).execute({}));
  } catch {
    return [];
  }
}

export async function createTag(name: string): Promise<Tag> {
  const repo = getRepo();
  return unwrap(
    await new CreateTagQuizUsecase(repo).execute(new CreateTagQuizParams(name)),
  );
}

export async function deleteTag(id: number): Promise<void> {
  const repo = getRepo();
  unwrap(
    await new DeleteTagQuizUsecase(repo).execute(new DeleteTagQuizParams(id)),
  );
}

export async function parseExcel(
  bankId: string,
  file: File,
): Promise<{ questions: ParsedQuestion[] }> {
  const repo = getRepo();
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = unwrap(
    await new ParseExcelQuizUsecase(repo).execute(
      new ParseExcelQuizParams(bankId, buffer, file.name),
    ),
  );
  return { questions: result.questions as ParsedQuestion[] };
}

export async function getDerivedBanks(bankId: string): Promise<DerivedBank[]> {
  const repo = getRepo();
  return unwrap(
    await new GetDerivedBanksQuizUsecase(repo).execute(
      new GetDerivedBanksQuizParams(bankId),
    ),
  );
}

export async function getBankRoadmaps(
  bankId: string,
): Promise<BankRoadmapItem[]> {
  const repo = getRepo();
  return unwrap(
    await new GetBankRoadmapsQuizUsecase(repo).execute(
      new GetBankRoadmapsQuizParams(bankId),
    ),
  );
}

export async function checkBankHash(hash: string): Promise<BankHashResult> {
  const repo = getRepo();
  const result = await new CheckBankHashQuizUsecase(repo).execute(
    new CheckBankHashQuizParams(hash),
  );
  return result.type === 'left' ? { exists: false } : result.value;
}
