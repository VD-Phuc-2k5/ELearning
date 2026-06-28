import { Either, Failure, NoParams, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetResourcesUsecase implements Usecase<string[], NoParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(_params: NoParams): Promise<Either<Failure, string[]>> {
    return this.repository.getResources();
  }
}
