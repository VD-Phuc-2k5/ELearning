'use server';

import {
  ApproveBankQuizUsecase,
  GetBankDetailQuizParams,
  GetBankDetailQuizUsecase,
  GetBanksQuizUsecase,
  GetQuestionsForQuizParams,
  GetQuestionsForQuizUsecase,
  RejectBankQuizParams,
  RejectBankQuizUsecase,
  type QuestionBank,
  type Question,
} from '@learning-hub/domain';
import {
  QuizRemoteDataSourceImpl,
  QuizRepositoryImpl,
} from '@learning-hub/data';

function getRepo() {
  return new QuizRepositoryImpl(new QuizRemoteDataSourceImpl());
}

export async function getPendingBanks(): Promise<QuestionBank[]> {
  const result = await new GetBanksQuizUsecase(getRepo()).execute({
    statusId: 'pending_review',
    limit: 100,
  });
  if (result.type === 'right') {
    return result.value.data;
  }
  return [];
}

export async function approveBank(bankId: string): Promise<QuestionBank> {
  const result = await new ApproveBankQuizUsecase(getRepo()).execute(bankId);
  if (result.type === 'right') {
    return result.value;
  }
  throw result.value;
}

export async function rejectBank(
  bankId: string,
  reason?: string,
): Promise<QuestionBank> {
  const result = await new RejectBankQuizUsecase(getRepo()).execute(
    new RejectBankQuizParams(bankId, reason),
  );
  if (result.type === 'right') {
    return result.value;
  }
  throw result.value;
}

export async function getBankDetail(
  bankId: string,
): Promise<QuestionBank | null> {
  const result = await new GetBankDetailQuizUsecase(getRepo()).execute(
    new GetBankDetailQuizParams(bankId),
  );
  if (result.type === 'right') {
    return result.value;
  }
  return null;
}

export async function getBankQuestions(bankId: string): Promise<Question[]> {
  const result = await new GetQuestionsForQuizUsecase(getRepo()).execute(
    new GetQuestionsForQuizParams(bankId, true),
  );
  if (result.type === 'right') {
    return result.value;
  }
  return [];
}
