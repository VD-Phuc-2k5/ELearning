import { Either, Failure } from '../core';

interface Usecase<ReturnType, ParamsType> {
  execute(params: ParamsType): Promise<Either<Failure, ReturnType>>;
}

type NoParams = Record<string, never>;

export type { Usecase, NoParams };
