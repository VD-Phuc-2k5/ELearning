import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl } from '@learning-hub/data';
import { QuizRepositoryImpl } from '@learning-hub/data';
import { ParseExcelQuizUsecase, ParseExcelQuizParams } from '@learning-hub/domain';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return Response.json({ status: 400, error: 'No file provided' }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const ds = new QuizRemoteDataSourceImpl();
  const repo = new QuizRepositoryImpl(ds, token);
  const result = await new ParseExcelQuizUsecase(repo).execute(new ParseExcelQuizParams(id, buffer, file.name));
  return result.type === 'right'
    ? Response.json({ status: 200, ...result.value })
    : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
