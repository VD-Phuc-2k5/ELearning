import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl } from '@learning-hub/data';
import { QuizRepositoryImpl } from '@learning-hub/data';
import { CheckBankHashQuizUsecase, CheckBankHashQuizParams } from '@learning-hub/domain';

type Ctx = { params: Promise<{ hash: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { hash } = await params;
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new CheckBankHashQuizUsecase(repo).execute(new CheckBankHashQuizParams(hash));
  return result.type === 'right'
    ? Response.json({ status: 200, ...result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
