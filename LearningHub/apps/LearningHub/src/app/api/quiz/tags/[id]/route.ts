import { NextRequest } from 'next/server';
import { QuizRemoteDataSourceImpl, QuizRepositoryImpl } from '@learning-hub/data';
import { DeleteTagQuizUsecase, DeleteTagQuizParams } from '@learning-hub/domain';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Ctx) {
    const { id } = await params;
    const token = (req.headers.get('authorization') ?? '').replace('Bearer ', '');
    const repo = new QuizRepositoryImpl(new QuizRemoteDataSourceImpl(), token);
    const result = await new DeleteTagQuizUsecase(repo).execute(new DeleteTagQuizParams(Number(id)));
    return result.type === 'right'
        ? Response.json({ status: 200 })
        : Response.json({ status: 400, error: result.value.message }, { status: 400 });
}
