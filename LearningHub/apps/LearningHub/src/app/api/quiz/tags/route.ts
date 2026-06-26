import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl } from '@learning-hub/data';
import { QuizRepositoryImpl } from '@learning-hub/data';
import { GetTagsQuizUsecase } from '@learning-hub/domain';

export async function GET(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new GetTagsQuizUsecase(repo).execute({});
  return result.type === 'right'
    ? Response.json({ status: 200, data: result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
