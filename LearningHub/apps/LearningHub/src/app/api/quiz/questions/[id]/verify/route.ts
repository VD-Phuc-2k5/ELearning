import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl } from '@learning-hub/data';
import { QuizRepositoryImpl } from '@learning-hub/data';
import { VerifyAnswerQuizUsecase, VerifyAnswerQuizParams } from '@learning-hub/domain';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const body = await req.json();
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new VerifyAnswerQuizUsecase(repo).execute(new VerifyAnswerQuizParams(id, body.selectedOptionId));
  return result.type === 'right'
    ? Response.json({ status: 200, ...result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
