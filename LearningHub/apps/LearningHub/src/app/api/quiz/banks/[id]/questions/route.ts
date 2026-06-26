import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl } from '@learning-hub/data';
import { QuizRepositoryImpl } from '@learning-hub/data';
import { GetQuestionsForQuizUsecase, GetQuestionsForQuizParams } from '@learning-hub/domain';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const showAnswers = req.nextUrl.searchParams.get('showAnswers') === 'true';
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new GetQuestionsForQuizUsecase(repo).execute(new GetQuestionsForQuizParams(id, showAnswers));
  return result.type === 'right'
    ? Response.json({ status: 200, data: result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
