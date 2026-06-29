import { Either, Failure, Usecase } from '@learning-hub/core';
import { IAuthRepository } from '../repositories/IAuthRepository';

export interface LogoutParams {
  refreshToken: string;
}

export class LogoutUsecase implements Usecase<void, LogoutParams> {
  constructor(private repository: IAuthRepository) {}
  async execute(params: LogoutParams): Promise<Either<Failure, void>> {
    return this.repository.logout(params.refreshToken);
  }
}
