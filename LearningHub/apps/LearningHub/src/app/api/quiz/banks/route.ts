import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl } from '@learning-hub/data';
import { QuizRepositoryImpl } from '@learning-hub/data';
import { GetBanksQuizUsecase, CreateBankQuizUsecase } from '@learning-hub/domain';

export async function GET(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const { searchParams } = new URL(req.url);
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new GetBanksQuizUsecase(repo).execute({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    search: searchParams.get('search') ?? undefined,
    tagId: searchParams.get('tagId') ? Number(searchParams.get('tagId')) : undefined,
    statusId: searchParams.get('statusId') ?? undefined,
  });
  return result.type === 'right'
    ? Response.json({ status: 200, ...result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const body = await req.json();
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new CreateBankQuizUsecase(repo).execute(body);
  return result.type === 'right'
    ? Response.json({ status: 200, data: result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
