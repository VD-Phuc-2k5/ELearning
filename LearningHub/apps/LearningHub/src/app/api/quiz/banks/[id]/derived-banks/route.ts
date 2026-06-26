import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl, QuizRepositoryImpl } from '@learning-hub/data';
import { GetDerivedBanksQuizUsecase, GetDerivedBanksQuizParams } from '@learning-hub/domain';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new GetDerivedBanksQuizUsecase(repo).execute(new GetDerivedBanksQuizParams(id));
  return result.type === 'right'
    ? Response.json({ status: 200, data: result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
