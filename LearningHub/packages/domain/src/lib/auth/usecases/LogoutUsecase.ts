import { Either, Failure, NoParams, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export class LogoutUsecase implements Usecase<void, NoParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(_params: NoParams): Promise<Either<Failure, void>> {
    return this.repository.logout();
  }
}
