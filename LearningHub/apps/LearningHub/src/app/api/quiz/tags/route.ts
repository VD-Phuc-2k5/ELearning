import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl, QuizRepositoryImpl } from '@learning-hub/data';
import { GetTagsQuizUsecase, CreateTagQuizUsecase, CreateTagQuizParams } from '@learning-hub/domain';

function makeRepo(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  return new QuizRepositoryImpl(new QuizRemoteDataSourceImpl(), token);
}

export async function GET(req: NextRequest) {
  const result = await new GetTagsQuizUsecase(makeRepo(req)).execute({});
  return result.type === 'right'
    ? Response.json({ status: 200, data: result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  const result = await new CreateTagQuizUsecase(makeRepo(req)).execute(new CreateTagQuizParams(name));
  return result.type === 'right'
    ? Response.json({ status: 200, data: result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
