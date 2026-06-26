import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class GetResourcesUsecase implements Usecase<string[], any> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: any): Promise<Either<Failure, string[]>> {
    return this.repository.getResources();
  }
}
