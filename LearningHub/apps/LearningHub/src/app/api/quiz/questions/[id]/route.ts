import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl } from '@learning-hub/data';
import { QuizRepositoryImpl } from '@learning-hub/data';
import { UpdateQuestionQuizUsecase, UpdateQuestionQuizParams2, DeleteQuestionQuizUsecase, DeleteQuestionQuizParams } from '@learning-hub/domain';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const body = await req.json();
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new UpdateQuestionQuizUsecase(repo).execute(new UpdateQuestionQuizParams2(id, body));
  return result.type === 'right'
    ? Response.json({ status: 200, data: result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new DeleteQuestionQuizUsecase(repo).execute(new DeleteQuestionQuizParams(id));
  return result.type === 'right'
    ? Response.json({ status: 200 })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
